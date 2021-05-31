const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: [true, "Please Provide name"] },
  email: {
    type: String,
    trim: true,

    required: [true, "Please provide email"],
  },

  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: [10, "password length should be greater than 10"],
  },
  active: { type: Boolean, default: false },
  
  photo: String,

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm Password"],
    validate: [
      {
        validator: function (el) {
          return this.password === el;
        },
        message: "Password doesn't match",
      },
    ],
  },
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
