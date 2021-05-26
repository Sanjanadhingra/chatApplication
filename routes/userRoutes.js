const userController = require("./../Controller/userController");
const express = require("express");
const router = express.Router();
router.post("/signUp", userController.signUp);
router.post("/login", userController.login);
//router.post("/confrimEmail/:token", userController.confirmEmail);
// router.post("/activeUser", userController.protect, userController.activeUser);
module.exports = router;
