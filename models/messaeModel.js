const mongoose = require("mongoose"),
  { Schema } = require("mongoose");
const messageSchema = new Schema({
  content: {
    type: String,
    required: [true],
  },
  userId: {
    type: Schema.Types.ObjectId,
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
