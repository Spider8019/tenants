const jwt= require("jsonwebtoken")
const userModel=require("../mongoose/owner.js")

const authowner = async(req,res,next) =>{

    try{
        const token=req.cookies.jwt
        console.log(token)
        const verify=jwt.verify(token,"helloiamspider8019");
        console.log(verify)

        const authuser=await userModel.findOne({_id:verify._id})

        req.token=token
        req.user=authuser

         next()
    }
    catch(error){
        res.send(`there is an error ${error}`)
    }

}

module.exports=authowner;