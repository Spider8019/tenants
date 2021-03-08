var mongoose =require("mongoose")
var bcrypt=require("bcryptjs")
var jwt=require("jsonwebtoken")

var userSchema=new mongoose.Schema({
    name:{type:String},
    avatar:{data:Buffer,contentType:String},
    aboutu:{type:String,default:"<i>Write something about you by updating your profile</i>"},
    homeAddress:{type:String},
    email:{type:String,unique:true},
    phone:{type:Number,unique:true},
    password:{type:String},
    dob:{type:Date},
    gender:{type:String},
    fatherName:{type:String},
    fatherPhone:{type:String},
    motherName:{type:String},
    motherPhone:{type:String},
    religion:{type:String},
    tokens:[{
        token:{
           type:String,
           required:true
        }
    }]
})

// generating auth token
userSchema.methods.generateAuthToken = async function(){
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
userSchema.pre("save",async function(next){
  if(this.isModified('password'))
  {
   this.password=await bcrypt.hash(this.password,10)
   }
   next()
})

module.exports=new mongoose.model("userModel",userSchema)