var mongoose=require("mongoose")

var roomSchema= new mongoose.Schema({
    ownerid:{type:String,required:true},
    name:{type:String,required:true},
    countRoom:{type:Number,required:true},
    rent:{type:Number,required:true},
    address:{type:String,required:true},
    longitude:{type:String},
    latitude:{type:String},
    description:{type:String,require:true},
    religionallowed:[{type:String}],
    nearByPlaces:[{
         type:String   
    }],
    nearByDistance:[{
         type:String   
    }],
    roomImg:{
        data:Buffer,
        contentType:String
    },
    lookingfor:[{
        type:String
    }],
    createdAt:{
        type:Date,default:Date.now()
    }
})

module.exports=new mongoose.model("roomModel",roomSchema)