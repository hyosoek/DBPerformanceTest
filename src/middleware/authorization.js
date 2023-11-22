const verify = require("./tokenVerify");

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

module.exports = {authCheck}