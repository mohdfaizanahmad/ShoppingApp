const mongoose = require("mongoose");

const OrderProductSchema = new mongoose.Schema(
  {
    product: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productAmount: {
          type: Number,
          default: 0,
        },
        quantity: {
          type: Number,
        },
      },
    ],

    shippingAddress: {
      type: String,
      required: true,
    },

    paymentDetails: {
      taxRate: {
        type: Number,
        default: 0,
      },
      taxAmount: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["Processing", "Dispatch", "Shipped", "Delivered", "Rejected"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderProductSchema);
module.exports = Order;
