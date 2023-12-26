const express = require("express");
const morgan = require("morgan");
const costumerRouter = require("./routes/costumerRouter");
const shopOwnerRouter = require("./routes/shopOwnerRouter");
const productRouter = require("./routes/productRouter");
const orderRouter = require("./routes/orderRouter");
const fileUpload = require("express-fileupload");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//API
app.use("/api/v1/costumer", costumerRouter);
app.use("/api/v1/shopOwner", shopOwnerRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
//Test api
app.get("/", (req, res) => {
  return res.send("Hello from backend");
});

module.exports = app;
