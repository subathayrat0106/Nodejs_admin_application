var mongoose = require("mongoose");

var StudentSchema = new mongoose.Schema({
    firstName:{ type:String, required: true},
    lastName:{ type:String, required: true},
    dob:String,
    studentEntryTime:String,
    finance :{
        tuition : Number,
        credit: Number,
        afterSchoolProgram:String,
        afterSchoolFee:Number,
        insuranceFee:Number,
        lunchFee:Number,
    },
    author:{
         id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
      },
      username:String,
    },
    updateFees:[
        {
      type:mongoose.Schema.Types.ObjectId,
      ref:"UpdateFee"
    }
    ],
       comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});


module.exports = mongoose.model("Student",StudentSchema);