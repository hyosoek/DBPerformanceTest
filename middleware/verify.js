const jwt = require("jsonwebtoken")

const verifyWithToken = async(req,res) =>{ // 토큰이 있는지 없는지만 확인
    const authorization = await req.headers.authorization;
    jwt.verify(authorization, process.env.randomNum)
    const payload = authorization.split(".")[1]
    const data = Buffer.from(payload,"base64")
    req.decoded = JSON.parse(data)
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
            "expiresIn" : process.env.tokenTime + "h"
        })
        return token
    }catch(err){
        console.log(`publishToken Error : ${err.message}`)
    }
}

module.exports = {verifyWithToken,publishToken}
