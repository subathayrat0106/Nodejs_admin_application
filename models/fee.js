var mongoose = require("mongoose");

var updateFeeSchema = new mongoose.Schema({
     updatedTuition:{type:Number,default:0},
     updatedCredit:{type:Number,default:0},
     updatedAfterSchoolFee:{type:Number,default:0},
     updatedInsuranceFee:{type:Number,default:0},
     updatedLunchFee:{type:Number,default:0},
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

module.exports = mongoose.model("UpdateFee", updateFeeSchema);