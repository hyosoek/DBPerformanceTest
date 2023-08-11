const inputCheck = require("../module/inputCheck.js");

const errorPass = async(err,req,res,next) =>{
    let result = {
        "success" : false,
        "message" : err.message,
        "auth" : false
    }
    console.log(err.message)
    res.send(result)
}

module.exports = {errorPass}