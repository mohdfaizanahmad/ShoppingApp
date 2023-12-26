const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const shopOwnerSchema = new mongoose.Schema(
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
      enum: ["admin", "employee"],
      default: "admin",
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
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

shopOwnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});
shopOwnerSchema.methods.correctPassword = function (
  candidatePassword,
  shopOwnerPassword
) {
  return bcrypt.compare(candidatePassword, shopOwnerPassword);
};
shopOwnerSchema.index(
  { passwordResetTokenExpiresIn: 1 },
  { expireAfterSeconds: 180 }
);
shopOwnerSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const ShopOwner = mongoose.model("ShopOwner", shopOwnerSchema);
module.exports = ShopOwner;
