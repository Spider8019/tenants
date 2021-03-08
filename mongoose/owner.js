var mongoose =require("mongoose")
var bcrypt=require("bcryptjs")
var jwt=require("jsonwebtoken")

var ownerSchema=new mongoose.Schema({
    residenceName:{type:String},
    ownerName:{type:String},
    ownerAvatar:{data:Buffer,contentType:String},
    ownerAboutu:{type:String,default:"<i>Write something about you by updating your profile</i>"},
    ownerPhone:{type:String,unique:true},
    ownerEmail:{type:String,unique:true},
    password:{type:String},
    religion:{type:String},
    owneran:{type:String},    
    ownerifsc:{type:String},
    tokens:[{
        token:{
           type:String,
           required:true
        }
    }]
})

// generating auth token
ownerSchema.methods.generateAuthToken = async function(){
    try{
            var token=jwt.sign({_id:this._id.toString()},"helloiamspider8019")
            this.tokens=this.tokens.concat({token:token})
            await this.save()
            return token
    }
    catch(error){
        console.log("there is an error")
    }
}

// hashing passwords
ownerSchema.pre("save",async function(next){
  if(this.isModified('password'))
  {
   this.password=await bcrypt.hash(this.password,10)
   }
   next()
})

module.exports=new mongoose.model("ownerModel",ownerSchema)