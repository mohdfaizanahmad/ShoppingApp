const express = require("express");
const productController = require("../controller/productController");
const shopOwnerController = require("../controller/shopOwnerController");
const authController = require("../controller/authController");
const router = express.Router();

router
  .route("/createProductDetails")
  .post(
    shopOwnerController.protect,
    shopOwnerController.restrictRoles("admin"),
    productController.createProductDetails
  );
router.route("/findAllProducts").get(productController.findAllProducts);
router.route("/findProductDetails").get(productController.findProductDetails);

router
  .route("/updateProductDetails/:productId")
  .patch(
    shopOwnerController.protect,
    shopOwnerController.restrictRoles("admin"),
    productController.updateProductDetails
  );

router
  .route("/deleteProduct/:productId")
  .delete(
    shopOwnerController.protect,
    shopOwnerController.restrictRoles("admin"),
    productController.deleteProduct
  );

router
  .route("/createProductReview")
  .patch(authController.protect, productController.createProductReviews);
router.route("/getProductReviews").get(productController.getProductReviews);
router
  .route("/deleteProductReviews")
  .delete(authController.protect, productController.deleteProductReviews);
module.exports = router;

module.exports = router;
