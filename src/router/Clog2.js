
const router = require("express").Router()

router.post("/",async(req,res,next)=>{
    const {email,pw} = req.body;
    const result = {
        "status" : 200,
        "message" : "",
        "data": {}
    }
    try{
        console.log("email is : " + email)
        console.log("pw is : " + pw)
        result.data.email = email
        result.data.pw = pw
        result.message = "successfull!"

        result.success = true;
        res.send(result)
    }catch(err){
        console.log("POST /Clog", err.message)
        next(err)
    } finally{
    }
})


module.exports = router