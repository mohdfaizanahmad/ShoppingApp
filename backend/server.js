const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({ path: "./confiq.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useunifiedTopology: true,
  })
  .then(() => console.log("Database connect successfully"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`App running on PORT : ${PORT}...`);
});
