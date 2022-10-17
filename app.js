const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");


// middlewares
app.use(express.json());
app.use(cors());


//routes
const userRoute = require("./routes/v1/user.route");
const jobRoute = require("./routes/v1/job.route");
const managerRoute = require("./routes/v1/manager.route");


//checking routes
app.get("/", (req, res) => {
    res.send("working properly!");
})


app.use("/user", userRoute);
app.use("/jobs", jobRoute);
app.use("/manager", managerRoute);


module.exports = app;
