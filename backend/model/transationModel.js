const mongoose = require("mongoose");

const shopOwnerSchema = new mongoose.Schema(
  {
    price: {
      type: String,
      required: true,
      trime: true,
    },

    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ShopOwner = mongoose.model("ShopOwner", shopOwnerSchema);
module.exports = ShopOwner;
