const express = require("express");
const shopOwnerController = require("../controller/shopOwnerController");
const router = express.Router();

router.route("/signUp").post(shopOwnerController.signUp);
router.route("/logIn").post(shopOwnerController.logIn);
router.route("/logOut").post(shopOwnerController.logOut);
router.route("/forgetPassword").post(shopOwnerController.forgetPassword);
router.route("/resetPassword/:token").patch(shopOwnerController.resetPassword);
router
  .route("/updateProfile")
  .patch(shopOwnerController.protect, shopOwnerController.updateProfile);
router
  .route("/updateMyPassword")
  .patch(shopOwnerController.protect, shopOwnerController.updateMyPassword);

module.exports = router;
