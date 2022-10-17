const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const colors = require("colors");
const app = require("./app");

// database connection
mongoose.connect(process.env.DATABASE).then(() => {
  console.log(`Database connection is working properly`.red.bold);
});

// server
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server is running on the port ${port}`.blue.bold);
});
