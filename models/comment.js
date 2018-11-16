var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text:String,
    title:String,
    createdAt:{type: Date, default: Date.now},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username:String,
        firstName:String,
        lastName:String
    }
});
module.exports = mongoose.model("Comment", commentSchema);