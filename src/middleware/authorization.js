const verify = require("./tokenVerify");

const adminCheck = async(req,res,next) =>{ // 관리자 권한을 가지고 있다면
    try{
        await verify.verifyWithToken(req)
        if(req.decoded.isAdmin == false || !req.decoded){
            const error = new Error("Admin Authorization Fail!");
            error.status = 403;
            throw error;
        }
        next()
    }catch(err){
        next(err)
    }
}

const userCheck = async(req,res,next) =>{ // 일반 사용자의 권한을 가지고 있으면
    try{
        await verify.verifyWithToken(req)
        if(req.decoded.isAdmin == true || !req.decoded){
            const error = new Error("User Authorization Fail!");
            error.status = 403;
            throw error;
        }
        next()
    }catch(err){
        next(err)
    }
}

const authCheck  = async(req,res,next) =>{ // 권한과 상관 없이
    try{
        await verify.verifyWithToken(req)
        if(!req.decoded){
            const error = new Error("Authorization Fail!");
            error.status = 403;
            throw error;
        }
        next()
    }catch(err){
        next(err)
    }
}



module.exports = {adminCheck,userCheck,authCheck}