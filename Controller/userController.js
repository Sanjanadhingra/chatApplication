const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.body.email}-${Date.now()}.${ext}`);
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
      photo: req.file.filename,
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
      data: { user, token },
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

// exports.signUp = async (req, res) => {
//   try {
//     const findUser = await User.findOne({ email: req.body.email });
//     if (findUser) {
//       throw new Error("This email already registered");
//     }
//     const user = await User.create({
//       name: req.body.name,
//       email: req.body.email,
//       password: req.body.password,
//       passwordConfirm: req.body.passwordConfirm,
//     });
//     console.log(user);

//     const token = await jwt.sign(
//       { id: user._id },
//       "THIS-IS-CHAT-APPLICATION-API"
//     );
//     console.log(token);
//     const updatedUser = await User.findByIdAndUpdate(
//       user._id,
//       {
//         confimationToken: token,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     console.log(updatedUser);

//     const resetUrl = `${req.protocol}://${req.get(
//       "host"
//     )}/api/v1/users/confirmEmail/${resetToken}`;
//     const message = `Forgot your password? Please make a patch request on this ${resetUrl} to update the password. If you didn't reuested for it.Please ignore it.`;
//     await sendEmail({
//       email: user.email,
//       subject: "Please confirm your email",
//       message,
//     });

//     res.status(200).json({
//       Status: "success",
//       message: "Please verify your email",
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };

// exports.confirmEmail = async (req, res, next) => {
//   //const user = req.params.token;
//   const user = await User.findOneandUpdate(
//     { confirmationToken: req.params.token },
//     { active: true }
//   );

//   res.status(400).json({
//     status: "success",
//     message: "Email verified",
//   });
// };

exports.login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      throw new Error("Please enter email or password");
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error("Wrong email or password");
    }

    //throw new Error('password or email is not correct');

    const token = jwt.sign({ id: user._id }, "THIS-IS-CHAT-APPLICATION-API");
    user.password = undefined;
    //console.log(io.io);

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

  const authenticatedUser = await User.findById(decoded.id);

  if (!authenticatedUser) {
    throw new Error("The User no longer exists");
  }
  req.user = authenticatedUser;
  next();
};

exports.activeUser = async (req, res) => {
  const users = await User.find({ active: true });
  console.log(users);
};
