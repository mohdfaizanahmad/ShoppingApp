const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trime: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trime: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 20,
      select: false,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    otpToken: {
      type: Number,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    pincode: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date,
  },
  { timestamps: true }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

customerSchema.methods.correctPassword = function (
  candidatePassword,
  costumerPassword
) {
  return bcrypt.compare(candidatePassword, costumerPassword);
};

customerSchema.index(
  { passwordResetTokenExpiresIn: 1 },
  { expireAfterSeconds: 180 }
);
customerSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

customerSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(passwordChangeAt.getTime() / 1000, 10);
    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
