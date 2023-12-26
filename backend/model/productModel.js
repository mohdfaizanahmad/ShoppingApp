const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trime: true,
    },
    description: {
      type: String,
      required: true,
      trime: true,
    },
    price: {
      type: String,

      required: true,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    quantity: {
      type: Number,
      required: true,
    },

    ratings: {
      type: Number,
      default: 0,
    },
    images: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    category: {
      type: String,
      required: [true, "Please enter product category"],
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "Customer",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    shopOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOwner",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
