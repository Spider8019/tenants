const express=require("express")
const bodyParser=require("body-parser")
const bcrypt=require("bcryptjs")
const cookieParser=require("cookie-parser")
const multer=require("multer")
var fs = require('fs');
var path = require('path');


const app=express()
app.use(cookieParser())
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");



const mongoose=require('mongoose')

mongoose.connect("mongodb+srv://spider8019official:spider8019official@cluster0.tljh0.mongodb.net/rent?retryWrites=true&w=majority",{useNewUrlParser:true,useCreateIndex:true})

var usersModel=require("./mongoose/user.js")
var ownersModel=require("./mongoose/owner.js")
var roomsModel=require("./mongoose/rooms.js")
var auth=require("./middleware/auth")
var authowner=require("./middleware/authowner")

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, 'uploads')
        if(file.fieldname === "roomImg"){
            cb(null,"uploads/rooms");
            }else{
            cb(null,"uploads");
            }
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });

app.route("/")
    .get(async(req,res)=>{
        try{
            var newRooms=await roomsModel.find({}).sort({createdAt:-1})
            var owners=await ownersModel.find({})
            var newOwners=[]
            for(var i=0;i<newRooms.length;i++){
                var owner=await ownersModel.findOne({_id:newRooms[i].ownerid})
                newOwners.push(owner)
            }
            res.render("home",{newRooms,newOwners,owners})
        }catch(error){
            res.send(`there is an error ${error}`)
        }
    })
app.route("/removeroom/:roomId")
    .get(async(req,res)=>{
        try{
            await roomsModel.deleteOne({_id:req.params.roomId})
            res.redirect("/profileowner")
        }catch(error){res.send(`there is an error ${error}`)}
    })
app.route("/searchby")
    .get(async(req,res)=>{
        console.log(req.query.searchBy)
        var searchByRooms=await roomsModel.find({ nearByPlaces : { $regex: req.query.searchBy, $options: 'i' } })
        searchByRooms.sort()
        res.send(searchByRooms)
    })
app.route("/rooms")
    .post(authowner,upload.single("roomImg"),async(req,res)=>{
        try{
            var obj=new roomsModel({
                ownerid:req.user._id,
                name:req.body.name,
                countRoom:req.body.countRoom,
                rent:req.body.rent,
                address:req.body.address,
                longitude:req.body.longitude,
                latitude:req.body.latitude,
                description:req.body.description,
                religionallowed:req.body.religion,
                nearByPlaces:req.body.nearByPlace,
                nearByDistance:req.body.nearByDistance,
                roomImg:{data: fs.readFileSync(path.join(__dirname + '/uploads/rooms/' + req.file.filename)),contentType: 'image/png'},
                lookingfor:req.body.lookingfor
            })
            await obj.save()
            res.redirect("/profileowner")
        }catch(error){
            res.send(`there is an error ${error}`)
        }
    })

app.route("/registerasowner")
    .get(async(req,res)=>{
        try{
            res.render("registerasowner")
        }catch(error){res.send(`there is an error ${error}`)}
    })
    .post(async(req,res)=>{
        try{
            var obj=new ownersModel({
                residenceName:req.body.residenceName,
                ownerName:req.body.ownerName,
                ownerPhone:req.body.ownerPhone,
                ownerEmail:req.body.ownerMail,
                password:req.body.ownerPassword,
                religion:req.body.religion,
                owneran:req.body.owneran,
                ownerifsc:req.body.ownerifsc
            })

            var token=await obj.generateAuthToken()
            res.cookie("jwt",token,{expires:new Date(Date.now()+60000000),httpOnly:true})

            await obj.save()
            res.redirect("/profileowner")

        }catch(error){res.send(`there is an error ${error}`)}
    })
app.route("/loginowner")
    .get(async(req,res)=>{
        try{
            // res.send("aman pratap singh")
             await res.render("loginowner")
        }
        catch(error){
              res.send(`there is an error ${error}`)
        }

    })
    .post(async(req,res)=>{
        try{
            var owner=await ownersModel.findOne({
                ownerEmail:req.body.email
            })
            console.log(owner)
            var isMatch=await bcrypt.compare(req.body.password,owner.password)
            console.log(owner.password)
            console.log(isMatch)
            if(isMatch)
            {
                var token =await owner.generateAuthToken()
                console.log(token)
                res.cookie("jwt",token,{expires:new Date(Date.now()+600000000),httpOnly:true})

                res.redirect("/profileowner")
            }
        }catch(e)
        {
            res.status(400).send(`user is not find ${e}`)
        }
    })
app.route("/profileowner")
       .get(authowner,async(req,res)=>{
           try{
               var profileowner=await ownersModel.findOne({_id:req.user._id})
               var rooms=await roomsModel.find({ownerid:req.user._id})
               res.render("profileowner",{profileowner,rooms})
           }catch(error){res.send(`there is an error ${error}`)}
       })
app.route("/profileowner/update")
    .post(authowner,upload.single('avatarOwner'),async(req,res)=>{
        try{
            var newAboutu=""
            var newAvatar={data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),contentType: 'image/png'}
            if(req.body.aboutu.length==0)
               newAboutu="Please add something about u"
            else
               newAboutu=req.body.aboutu;

            await ownersModel.updateOne({_id:req.user._id},{ownerAvatar:newAvatar,ownerAboutu:newAboutu})
            res.redirect("/profileowner")
        }catch(error){
            res.send(`there is an error ${error}`)
        }
    })

// usersection
app.route("/profile")
    .get(auth,async(req,res)=>{
        try{
 
            var user=await usersModel.findOne({_id:req.user._id})

            res.render("profile",{user})
        }catch(error){res.send(`there is an error ${error}`)}
    })
app.route("/profile/update")
    .post(auth,upload.single('avatar'),async(req,res)=>{
        try{
            var newAboutu=""
            var newAvatar={data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),contentType: 'image/png'}
            if(req.body.aboutu.length==0)
               newAboutu="Please add something about u"
            else
               newAboutu=req.body.aboutu;

            await usersModel.updateOne({_id:req.user._id},{avatar:newAvatar,aboutu:newAboutu})
            res.redirect("/profile")
        }catch(error){
            res.send(`there is an error ${error}`)
        }
    })
app.route("/signup")
    .get(async(req,res)=>{
        try{
            res.render("signup")
        }catch(error){res.send(`there is an error ${error}`)}
    })
    .post(async(req,res)=>{
        try{
            var obj=new usersModel({
                name:req.body.name,
                homeAddress:req.body.homeAddress,
                email:req.body.email,
                phone:req.body.phone,
                password:req.body.password,
                dob:req.body.dob,
                gender:req.body.gender,
                fatherName:req.body.fatherName,
                fatherPhone:req.body.fatherPhone,
                motherName:req.body.motherName,
                motherPhone:req.body.motherPhone,
                religion:req.body.religion
            })
        var token=await obj.generateAuthToken()
        console.log(token)
        res.cookie("jwt",token,{expires:new Date(Date.now()+60000000),httpOnly:true})

        await obj.save()
        res.send("successfully registered")

        }catch(error){res.send(`there is an error ${error}`)}
    })
app.route("/login")
    .get(async(req,res)=>{
        try{
            // res.send("aman pratap singh")
             await res.render("login")
        }
        catch(error){
              res.send(`there is an error ${error}`)
        }

    })
    .post(async(req,res)=>{
        try{
            var user=await usersModel.findOne({
                email:req.body.email
            })
            console.log(user)
            var isMatch=await bcrypt.compare(req.body.password,user.password)
            console.log(isMatch)
            if(isMatch)
            {
                var token =await user.generateAuthToken()
                console.log(token)
                res.cookie("jwt",token,{expires:new Date(Date.now()+600000000),httpOnly:true})

                res.redirect("/profile")
            }
        }catch(e)
        {
            res.status(400).send(`user is not find ${e}`)
        }
    })
app.get("/logout",auth,async function(req,res){
     res.clearCookie("jwt")      
     req.user.tokens=[]
     req.user.save()
     res.redirect("/login")

})

var port = process.env.PORT || 3000
app.listen(port,()=>{console.log(`server started on port ${port}`)})