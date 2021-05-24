const mongoose = require("mongoose"),
  { Schema } = require("mongoose");
const messageSchema = new Schema({
  content: {
    type: [String],
    required: [true],
  },
  userName: {
    type: String,
    required: [true],
  },
  from: {
    type: Schema.Types.ObjectId,
  },
  userId: {
    type: Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
