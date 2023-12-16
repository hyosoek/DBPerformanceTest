const inputCheck = require("../module/inputCheck.js")
const verify = require("../middleware/tokenVerify.js");

const router = require("express").Router()

router.post("/login",async(req,res,next)=>{
    const {email,pw} = req.body;
    const result = {
        "status" : 200,
        "message" : "",
        "data": {}
    }
    const userData = {
        "id" : 1
    }
    try{
        console.log("email is : " + email)
        console.log("pw is : " + pw)
        result.data.email = email
        result.data.pw = pw
        result.message = "successfull!"

        console.log(req.headers)
        let token = await verify.publishToken(userData)
        res.cookie("accessToken", token, {
            secure: true
        });
        console.log(token)
        result.success = true;
        res.send(result)
    }catch(err){
        console.log("POST /Clog", err.message)
        next(err)
    } finally{
    }
})


module.exports = router