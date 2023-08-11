const verify = require("./verify");

const adminCheck = async(req,res,next) =>{ // 관리자 권한을 가지고 있다면
    try{
        await verify.verifyWithToken(req,res)
        if(req.decoded.isAdmin == false || !req.decoded){
            throw new Error()
        }
        next()
    }catch(err){
        err.message = "Admin verifying Fail"
        next(err)
    }
}

const userCheck = async(req,res,next) =>{ // 일반 사용자의 권한을 가지고 있으면
    try{
        await verify.verifyWithToken(req,res)
        if(req.decoded.isAdmin == true || !req.decoded){
            throw new Error()
        }
        next()
    }catch(err){
        err.message = "User verifying Fail"
        next(err)
    }
}

const authCheck  = async(req,res,next) =>{ // 권한과 상관 없이
    try{
        await verify.verifyWithToken(req,res)
        if(!req.decoded){
            throw new Error()
        }
        next()
    }catch(err){
        err.message = "normal verifying Fail"
        next(err)
    }
}

module.exports = {adminCheck,userCheck,authCheck}