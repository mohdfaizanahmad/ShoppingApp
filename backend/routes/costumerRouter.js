const express = require("express");
const costumerController = require("../controller/costumerController");
const authController = require("../controller/authController");
const router = express.Router();

router.route("/signUp").post(costumerController.signUp);
router.route("/signUpVerification").post(costumerController.signUpVerification);

router.route("/logIn").post(costumerController.logIn);
router.route("/logOut").post(costumerController.logOut);

router.route("/forgetPassword").post(costumerController.forgetPassword);
router.route("/resetPassword/:token").patch(costumerController.resetPassword);
router
  .route("/updateProfile")
  .patch(authController.protect, costumerController.updateProfile);
router
  .route("/updateMyPassword")
  .patch(authController.protect, costumerController.updateMyPassword);

module.exports = router;
