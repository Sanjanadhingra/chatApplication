const mongoose = require("mongoose"),
  { Schema } = require("mongoose");
const tokenSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true
    },    
    token:{
        type:String,
        required:true
    },createdAt:{
        type:Date,
        default:Date.now(),
        expires:3600
    }
});
module.exports = mongoose.model("Token",tokenSchema);