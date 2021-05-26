const userController = require("./../Controller/userController");
const express = require("express");
const router = express.Router();
router.post("/signUp", userController.uploadPhoto, userController.signUp);
router.post("/login", userController.login);
//router.post("/confrimEmail/:token", userController.confirmEmail);
router.post("/uploadProfilePic", userController.protect, userController.uploadPhoto);
module.exports = router;
