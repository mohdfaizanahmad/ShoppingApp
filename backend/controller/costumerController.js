const Customer = require("../model/costumerModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("./../utils/email");
const otpGenerator = require("otp-generator");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const sendToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res, message) => {
  const token = sendToken(user._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const { name, email, password, phone, address, pincode, state } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !pincode ||
    !state
  ) {
    return res.status(400).json({ message: "Please fill all details" });
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const message = `OTP for account verification ${otp}`;
  try {
    await sendEmail({
      email: req.body.email,
      subject: "Otp valid for 10 min",
      message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
  const exitsCostumer = await Customer.findOne({ email });
  if (exitsCostumer) {
    return res.status(200).json({ message: "Email already exits" });
  }
  const newCustomer = await Customer.create({
    otpToken: parseInt(otp),
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    address: req.body.address,
    pincode: req.body.pincode,
    state: req.body.state,
  });

  createSendToken(newCustomer, 200, res, "User register successfully");
});
exports.signUpVerification = catchAsync(async (req, res, next) => {
  const user = await Customer.findOne({ email: req.body.email });

  if (user.is_verified) {
    return res.status(400).json({
      message: "Otp already verified",
    });
  }

  if (user.otpToken === parseInt(req.body.otp)) {
    (user.otpToken = undefined), (user.is_verified = true);
    await user.save();
  } else {
    return res.status(401).json({
      status: "fail",
      message: "OTP didn't matched",
    });
  }
  createSendToken(user, 200, res, "OTP verified");
});

// exports.signUp = catchAsync(async (req, res) => {
//   const { name, email, password, phone, address, pincode, state } = req.body;

//   if (
//     !name ||
//     !email ||
//     !password ||
//     !phone ||
//     !address ||
//     !pincode ||
//     !state
//   ) {
//     return res.status(400).json({ message: "Please fill all details" });
//   }

//   const exitsCostumer = await Customer.findOne({ email });
//   if (exitsCostumer) {
//     return res.status(200).json({ message: "Email already exits" });
//   }

//   const newCustomer = await Customer.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     phone: req.body.phone,
//     address: req.body.address,
//     pincode: req.body.pincode,
//     state: req.body.state,
//   });

//   createSendToken(newCustomer, 200, res, "User register successfully");
// });

exports.logIn = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  const customer = await Customer.findOne({ email }).select("+password");
  if (
    !customer ||
    !(await customer.correctPassword(password, customer.password))
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Email and Password incorrect",
    });
  }

  createSendToken(customer, 200, res);
});

exports.logOut = catchAsync(async (req, res) => {
  res
    .status(200)
    .clearCookie("jwt")
    .json({ message: "Logout successfully", status: "Success" });
});

exports.updateProfile = catchAsync(async (req, res) => {
  if (req.body.password || req.body.passwordConfirm) {
    return res
      .status(400)
      .json({ message: "This route is not for update password" });
  }
  const filterFields = filterObj(req.body, "name", "email", "phone", "address");
  // const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filterFields.image = req.file.filename;
  const updatedUser = await Customer.findByIdAndUpdate(
    req.user.id,
    filterFields,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    message: "Data update successfull",
    data: {
      updatedUser,
    },
  });
});

exports.updateMyPassword = catchAsync(async (req, res) => {
  const user = await Customer.findById(req.user).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return res.status(400).json({ message: "Your Current password wrong" });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});

exports.forgetPassword = catchAsync(async (req, res) => {
  //1) Find user with posted email
  const user = await Customer.findOne({ email: req.body.email });

  if (!user) {
    return res
      .status(404)
      .json({ message: "There is no user with this email" });
  }

  // 2) Generate random bytes reset Token

  const resetToken = user.createPasswordResetToken();
  // console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/shopOwner/forgetPassword/${resetToken}`;

  const message = `Forget your password? Your new password and confirm password ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
  }
});

exports.resetPassword = catchAsync(async (req, res) => {
  //1) Get user base on hashed token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await Customer.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Token has been expired and invalid",
    });
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return res.json({
      message: "Password doesn't match",
    });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save();

  res.status(200).json({
    message: "Password reset successfully.",
    user,
  });
});
