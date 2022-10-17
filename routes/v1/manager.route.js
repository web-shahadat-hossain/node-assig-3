const express = require("express");
const router = express.Router();
const jobController = require("../../controllers/job.controller");
const authorization = require("../../middleware/authorization");
const verifyToken = require("../../middleware/verifyToken");


router
    .route("/jobs")
    .get(verifyToken, authorization("Admin", "Hiring-Manager"), jobController.getJobsByManagerToken);

router
    .route("/jobs/:id")
    .get(verifyToken, authorization("Admin", "Hiring-Manager"), jobController.getJobByManagerTokenJobId);

module.exports = router;
