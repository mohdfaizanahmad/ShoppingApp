const ShopOwner = require("../model/shopOwnerModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");

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

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization ||
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    return res.json({
      message: "Please login.",
    });
  }

  // Verification of token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  // console.log({ decoded: decoded.id });
  // Check if user still exits

  const currentShopOwner = await ShopOwner.findById(decoded.id);
  if (!currentShopOwner) {
    return res
      .status(401)
      .json({ message: "The user belonging to this token does not exits" });
  }

  req.user = currentShopOwner;
  next();
});

exports.restrictRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role: ${req.user.role} is not allowed to access this resource`,
      });
    }
    next();
  };
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

  const exitsShopOwner = await ShopOwner.findOne({ email });
  if (exitsShopOwner) {
    return res.status(200).json({ message: "Email already exits" });
  }

  const newShopOwner = await ShopOwner.create({
    name,
    email,
    password,
    phone,
    address,
    pincode,
    state,
  });

  createSendToken(newShopOwner, 200, res, newShopOwner.message);
});

exports.logIn = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  const shopOwner = await ShopOwner.findOne({ email }).select("+password");
  if (
    !shopOwner ||
    !(await shopOwner.correctPassword(password, shopOwner.password))
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Email and Password incorrect",
    });
  }
  createSendToken(shopOwner, 200, res);
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
  const filterFields = filterObj(
    req.body,
    "name",
    "email",
    "phone",
    "address",
    "pincode",
    "state"
  );

  const updatedUser = await ShopOwner.findByIdAndUpdate(
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
  const user = await ShopOwner.findById(req.user).select("+password");

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
  const user = await ShopOwner.findOne({ email: req.body.email });

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

  const user = await ShopOwner.findOne({
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
