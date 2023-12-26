const catchAsync = require("../utils/catchAsync");
const Order = require("./../model/orderModel");

// Function to calculate the total price
function calculateTotalPrice(products, taxRate) {
  const subtotal = products.reduce(
    (total, product) => total + product.productAmount * product.quantity,
    0
  );

  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  return totalAmount;
}
exports.orderProduct = catchAsync(async (req, res) => {
  const { product, shippingAddress, paymentDetails } = req.body;
  if (!product || !shippingAddress || !paymentDetails) {
    return res.status(400).json({ message: "Please fill all details" });
  }
  const totalPrice = calculateTotalPrice(product, paymentDetails.taxRate);

  // Create a new order with the calculated total price
  const newOrder = await Order.create({
    product,
    shippingAddress,
    paymentDetails: {
      ...paymentDetails,
      totalAmount: totalPrice,
    },
  });

  // Send a response with the address and calculated price
  res.status(201).json({
    message: "Order created successfully",
    // address: shippingAddress,
    totalPrice,
    newOrder,
  });
});

// Get All Orders

exports.getAllOrders = catchAsync(async (req, res) => {
  const getAllOrders = await Order.find();
  if (!getAllOrders) {
    return res.status(404).json({ message: "No Orders found" });
  }
  res.status(200).json({
    message: "Orders found successfully",
    getAllOrders,
  });
});

// Get One Order
exports.getOneOrder = catchAsync(async (req, res) => {
  const getOneOrder = await Order.findById(req.params.orderId);
  if (!getOneOrder) {
    return res.status(404).json({ message: "No Order found" });
  }
  res.status(200).json({
    message: "Order found successfully",
    getOneOrder,
  });
});

// Delete Order
exports.deleteOrders = catchAsync(async (req, res) => {
  const deleteOrder = await Order.findByIdAndDelete(req.params.orderId);
  res.status(200).json({
    message: "Order delete successfully",
    deleteOrder,
  });
});

// Update Order
exports.updateOrderDetails = catchAsync(async (req, res) => {
  const orderDetails = await Order.findByIdAndUpdate(
    req.params.orderId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    message: "Order update successfully",
    orderDetails,
  });
});

// Order Dispatched

exports.orderDispatched = catchAsync(async (req, res) => {
  const orders = await Order.findByIdAndUpdate(req.params.orderId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Order dispatched",
    orders,
  });
});

// Order Rejected

exports.orderRejected = catchAsync(async (req, res) => {
  const orders = await Order.findByIdAndUpdate(req.params.orderId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Order Rejected",
    orders,
  });
});
