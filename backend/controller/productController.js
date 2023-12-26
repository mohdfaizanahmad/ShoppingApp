const catchAsync = require("../utils/catchAsync");
const Product = require("./../model/productModel");
const ApiFeatures = require("./../utils/apiFeatures");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dpyybzsvh",
  api_key: "539311469449345",
  api_secret: "O5xMcQq0B2ZzSrWUNrKy-98aKlM",
  secure: true,
});

exports.createProductDetails = catchAsync(async (req, res) => {
  const { name, price, description, quantity, image, category } = req.body;
  // Check if a file is uploaded

  if (!req.files || !req.files.image) {
    return res.status(400).json({ message: "Please upload an image file" });
  }

  const file = req.files.image;

  const result = await cloudinary.uploader.upload(file.tempFilePath);

  const newProduct = await Product.create({
    name,
    price,
    description,
    quantity,
    category,
    shopOwner: req.user.id,
    image: { public_id: result.public_id, url: result.url },
  });

  res.status(201).json({
    status: "success",
    message: "Product added successfully",
    newProduct,
  });
});

exports.findAllProducts = catchAsync(async (req, res) => {
  const productCount = await Product.countDocuments();
  const apiFeatures = new ApiFeatures(
    Product.find().populate({
      path: "shopOwner",
      select: "name email role",
    }),
    req.query
  )
    .search()
    .filter()
    .pagination();
  const findAllProducts = await apiFeatures.query;
  if (!findAllProducts) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({
    status: "success",
    message: "Find all Products",
    productCount,
    findAllProducts,
  });
});
exports.findProductDetails = catchAsync(async (req, res) => {
  const { productId } = req.body;
  const findProductDetails = await Product.findById(productId).populate({
    path: "shopOwner",
  });

  if (!findProductDetails) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({
    status: "success",
    message: "Product found",
    findProductDetails,
  });
});

exports.updateProductDetails = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const updateDetails = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updateDetails) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({
    status: "success",
    message: "Product details updated successfully",
    updateDetails,
  });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const productDelete = await Product.findByIdAndDelete(productId);

  if (!productDelete) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({
    status: "success",
    message: "Product details deleted successfully",
    productDelete,
  });
});

// Create Reviews and Update

exports.createProductReviews = catchAsync(async (req, res) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // Calculate review rating

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg = avg + Number(rev.rating);
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "success",
    product,
  });
});

exports.getProductReviews = catchAsync(async (req, res) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  res.status(200).json({
    message: "Product found successfully",
    product,
  });
});

exports.deleteProductReviews = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  if (reviews.length > 0) {
    reviews.forEach((rev) => {
      avg = avg + Number(rev.rating);
    });
    avg = avg / reviews.length;
  }

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings: avg,
      numOfReviews: reviews.length,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Review deleted successfully",
    product,
  });
});
