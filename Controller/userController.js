const User = require("./../models/userModel");
const Token = require('./../models/tokenModel');
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const crypto = require('crypto');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Not an image", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single("photo");

exports.signUp = async (req, res, next) => {
  try {
    const findUser = await User.findOne({ email: req.body.email });
    if (findUser) {
      throw new Error("This email already registered");
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    console.log(user);

    const token = await jwt.sign(
      { id: user._id },
      "THIS-IS-CHAT-APPLICATION-API"
    );
    console.log(token);

    await sendEmail({
      email: user.email,
      subject: "Welcome to chat application",
      message: "Thanks for joining us",
    });
    user.password = undefined;

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    if (err.name == "ValidationError") {
      const messages = Object.values(err.errors).map((value) => value.message);

      console.error("Error Validating!", err);
      res.status(422).json({
        status: "fail",
        message: messages.join(". "),
      });
    } else {
      console.error(err);
      res.status(404).json(err.message);
    }
  }
};


exports.login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      throw new Error("Please enter email or password");
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error("Wrong email or password");
    }

    const token = jwt.sign({ id: user._id }, "THIS-IS-CHAT-APPLICATION-API");
    user.password = undefined;

    res.status(201).json({
      data: { token, user },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protect = async (req, res) => {
  try {
    let token;

    if (
      req.headers.authorization ||
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw new Error("You are not logged in.Please login to get access");
    }

    /////verification of token
    const decoded = await jwt.verify(token, "THIS-IS-CHAT-APPLICATION-API");
    console.log(decoded);

    const authenticatedUser = await User.findById(decoded.id);

    if (!authenticatedUser) {
      throw new Error("The User no longer exists");
    }
    req.user = authenticatedUser;

    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};


exports.changePasswordRequest = async (req, res) => {
  
  let user = await User.findOne({email:req.body.email});
  if (!user){
    throw new Error ('User does not exist in database...');
  }
  let token = await Token.findOne({userId:user._id});
  if (token){
    await token.deleteOne();
  }
  let newToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(newToken,12);

  await new Token({
    userId: user._id,
    token:hashedToken,
    createdAt:Date.now()
  }).save();

  const resetLink = `http://localhost:3000/passwordReset?token=${hashedToken}&id=${user._id}`

  
  await sendEmail({
    email:user.email,
    subject:"Password Reset Link",
    message: `Use the link attached for password reset  ${resetLink} and token is ${hashedToken}`
  })
  
  res.json(resetLink);

exports.updateMe = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      photo: req.file.filename,
    });
    console.log(user);
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }

};


exports.passwordChange = async (req,res)=>{
  // console.log(req.body);
  // res.status(200).send(req.body);
  isPasswordResetTokenValid = await Token.findOne({userId:req.body.userId});

  if(!isPasswordResetTokenValid){
    throw new Error ('This token is expired....')
  }

  console.log(isPasswordResetTokenValid)
  console.log('dbtoken:',isPasswordResetTokenValid.token)
  console.log('bodytoken',req.body.token);
  isValid = req.body.token === isPasswordResetTokenValid.token

  if(!isValid){
     throw new Error ('Invalid token plss provide geniuine token...');
  }

  const hashedPassword = await bcrypt.hash(req.body.password,12);

  await User.updateOne(
    { _id: req.body.userId},
    {$set : {password:hashedPassword}},
    {new:true}
  );

  const user = await User.findOne({_id:req.body.userId});
  await sendEmail({
    email:user.email,
    subject:"Password Reset Sucessfull.",
    message:`Dear ${user.name} you have successfully change your password.`
  });

  await isPasswordResetTokenValid.deleteOne();
  res.status(200).send('Password change successful');
}
