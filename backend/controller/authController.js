const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Customer = require("./../model/costumerModel");
const catchAsync = require("../utils/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      res.status(401).json({
        message: "You are not logged in! Please log in to get access.",
      })
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  // 3) Check if user still exists

  const currentUser = await Customer.findById(decoded.id);
  if (!currentUser) {
    return next(
      res.status(401).json({
        message: "The user belonging to this token does no longer exist.",
      })
    );
  }
  // Check if user recentlt changed password

  if (currentUser.changePasswordAfter(decoded.iat)) {
    return res.status(400).json({
      status: "fail",
      message: "User recently change password, please logIn again",
    });
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;

  next();
});
