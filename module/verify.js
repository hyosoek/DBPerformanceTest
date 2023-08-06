const jwt = require("jsonwebtoken")
const Configure = require('@sub0709/json-config');
const conf = Configure.load('config.json');
const path = require("path")


const verifyWithToken = async(req,res,next) =>{ // 토큰이 있는지 없는지만 확인
    try{
        const authorization = await req.headers.authorization;
        if(authorization){ // 헤더로 바꾸면 상관없는 일
            jwt.verify(authorization, process.env.randomNum)
            const payload = authorization.split(".")[1]
            const data = Buffer.from(payload,"base64")
            req.decoded = JSON.parse(data)
        }
    } catch(err){
        console.log(`토큰만료 : ${err.message}`)
    } finally{
        next()
    }
}


const publishToken = async(userData) =>{ //갱신과, 생성을 동시에 하나의 코드로
    try{
        const token = jwt.sign({
            "userNum": userData.usernum //payload
            ,"userId": userData.id
            ,"isAdmin": userData.isadmin
        },
        process.env.randomNum,
        {
            "issuer" : "hyoseok",
            "expiresIn" : "24h"
        })
        return token
    }catch(err){
        console.log(`publishToken Error : ${err.message}`)
    }
}

module.exports = {verifyWithToken,publishToken}
