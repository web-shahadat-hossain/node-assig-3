const express = require("express");
const userController = require("../../controllers/user.controller");
// const authorization = require("../middleware/authorization");
const verifyToken = require("../../middleware/verifyToken");
const router = express.Router();


router.post("/signup", userController.signup);


router.post("/login", userController.login);


router.get("/me", verifyToken, userController.getMe);


module.exports = router;