const cors = require("cors");
const userController = require("./../Controller/userController");
const express = require("express");
const router = express.Router();
router.use(cors());
router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
router.post("/signUp", userController.signUp);
router.post("/login", userController.login);
//router.post("/confrimEmail/:token", userController.confirmEmail);
router.post(
  "/uploadProfilePic",
  userController.protect,
  userController.uploadPhoto,
  userController.updateMe
);
//router.get("/getChatHistory", userController.loadAllMessages);

module.exports = router;
