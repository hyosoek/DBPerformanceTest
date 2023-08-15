const path = require("path");

const errorPass = (err,req,res) =>{
    const result = {
        "success" : false,
        "message" : ""
        }
    try{
        if(!err.status){//미지정 status = 예측불가 오류
            err.status = 500
            err.message = "Server Error!"
        }

        result.message = err.message; // 
        console.error("Error_"+err.status +" : "+err.message);
        res.status(err.status).send(result);
    }
    catch(newerr){ // 혹시 모르는 에러 발생
        console.log(newerr.message)
        res.send(result)
    }
}

const error404Pass = (req, res, next)=>{
    try{
        throw new Error();
    }
    catch(err){
        err.status = 404;
        err.message = "404 NOT found"
    } finally{
        next(err);
    }
}

module.exports = {errorPass,error404Pass}