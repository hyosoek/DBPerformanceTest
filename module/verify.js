const jwt = require("jsonwebtoken")
const Configure = require('@sub0709/json-config');
const conf = Configure.load('config.json');
const path = require("path")


const verifyWithToken = async(req,res,next) =>{ // 토큰이 있는지 없는지만 확인
    try{
        const calledApi = `${req.method} ${req.originalUrl}`
        console.log(removeQueryString(calledApi))
        const nonVerifyApiList = conf.withoutTokenApi
        if(nonVerifyApiList.includes(removeQueryString(calledApi))){
            next() // 토큰인증이 필요없는 api
        } else{
            if(req.query.token){
                req.customData = await tokenToData(req.query.token)
            } else if(req.body.token){
                req.customData = await tokenToData(req.body.token)
            }
            if(await req.customData){//만료된 토큰 혹은 유효하지 않은 토큰이라면,
                console.log("토큰인증성공")
                next()
            }else{
                console.log("토큰인증실패")
                // res.sendFile(path.join(__dirname, "../index.html"))
                // 어떻게 초기화면으로 되돌릴 것인가?
            }
        }
    }catch(err){
        console.log(`verifyToken Error : ${err.message}`)
    }
}

const removeQueryString= (str) => {
    const questionMarkIndex = str.indexOf('?');
    if (questionMarkIndex !== -1) {
      return str.substring(0, questionMarkIndex);
    } else {
      return str;
    }
}

const tokenToData = async(token)=>{
    try{
        jwt.verify(token,process.env.randomNum)
        const payload = token.split(".")[1]
        const data = Buffer.from(payload,"base64")
        return JSON.parse(data)
    }catch (err){
        console.log("토큰만료")
    }
        
}

const publishToken = async(req,res,next) =>{ //갱신과, 생성을 동시에 하나의 코드로
    try{
        //req.customData가 없을 수 있나?
        const tokenData = await req.customData
        const token = jwt.sign({
            "userNum": tokenData.userNum //payload
            ,"userId": tokenData.userId
            ,"isAdmin": tokenData.isAdmin
        },
        process.env.randomNum,
        {
            "issuer" : "hyoseok",
            "expiresIn" : "10s"
        })
        console.log(req.resData)
        req.resData.token = token
        next()
    }catch(err){
        console.log(`publishToken Error : ${err.message}`)
    }
}

module.exports = {verifyWithToken,publishToken}

// if(req.customData){ //새로운 데이터가 있으면(로그인) 새 토큰 생성
//     console.log("createtoken")
//     const token = jwt.sign({
//         "usernum": req.customData.userNum //payload
//         ,"userid": req.customData.userId
//         ,"isadmin": req.customData.isAdmin
//     },
//     process.env.randomNum,
//     {
//         "issuer" : "hyoseok",
//         "expiresIn" : "10s"
//     })
//     req.resData.token = token
// } else if (req.token){ //새로운 데이터가 없고, 기존 토큰이 존재하는 경우
//     console.log("renewtoken")
//     const token = req.token
//     jwt.verify(token,process.env.randomNum)
//     const payload = token.split(".")[1]
//     const data = Buffer.from(payload,"base64")

//     const newToken = jwt.sign(JSON.parse(data),
//     process.env.randomNum,
//     {
//         "issuer" : "hyoseok",
//         "expiresIn" : "10s"
//     })
//     req.resData.token = newToken
// }
// next()