const userController = require("./../Controller/userController");
const express = require("express");
const router = express.Router();
router.post("/signUp", userController.signUp);
router.post("/login", userController.login);


router.post('/changePasswordRequest',userController.changePasswordRequest);
router.post('/changePassword',userController.passwordChange);
// router.post("/uploadProfilePic", userController.protect, userController.uploadPhoto);
router.patch(
  "/uploadProfilePic",
  userController.protect,
  userController.uploadPhoto,
  userController.updateMe
);

module.exports = router;
