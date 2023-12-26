const express = require("express");
const authController = require("./../controller/authController");
const orderController = require("../controller/orderController");
const shopOwnerController = require("../controller/shopOwnerController");

const router = express.Router();

router
  .route("/orderProduct")
  .post(authController.protect, orderController.orderProduct);
router
  .route("/getAllOrder")
  .get(authController.protect, orderController.getAllOrders);
router
  .route("/getOrder/:orderId")
  .get(authController.protect, orderController.getOneOrder);
router
  .route("/update/:orderId")
  .patch(authController.protect, orderController.updateOrderDetails);
router
  .route("/delete/:orderId")
  .delete(authController.protect, orderController.deleteOrders);

router
  .route("/orderDispatched/:orderId")
  .patch(shopOwnerController.protect, orderController.orderDispatched);
router
  .route("/orderRejected/:orderId")
  .patch(shopOwnerController.protect, orderController.orderRejected);

module.exports = router;
