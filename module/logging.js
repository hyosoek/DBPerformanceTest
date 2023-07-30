const inputCheck = require("../module/inputCheck.js");

const logging = async(req,res) =>{
    const result = { ...req.resData };
    let conn = null //중요!
    try{
        const userId = null
        if(req.session.userid){userId = req.session.userid}
        else {userId = ""}

        const reqData = null
        if(req.body){reqData = req.body}
        else if(req.query){reqData = req.query}
        else if(req.params){reqData = req.params}

        const idCheck = new inputCheck(req.session.userid)
        const ipCheck = new inputCheck(req.ip)
        const apiCheck = new inputCheck(req.originalUrl)
        const restCheck = new inputCheck(req.method)
        const requestCheck = new inputCheck(reqData)
        const responseCheck = new inputCheck(result)
        //respo

        if (idCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = idCheck.errMessage
        else if (ipCheck.isEmpty().result != true) result.message = ipCheck.errMessage // isIP 넣어야할 듯
        else if (apiCheck.isMinSize(1).isMaxSize(1023).isEmpty().result != true) result.message = apiCheck.errMessage
        else if (restCheck.isMinSize(1).isMaxSize(10).isEmpty().result != true) result.message = restCheck.errMessage
        else if (requestCheck.isEmpty().result != true) result.message = requestCheck.errMessage
        else if (responseCheck.isEmpty().result != true) result.message = responseCheck.errMessage
        else{
            const currentTime = new Date();
            conn  = await client.connect(process.env.mongoDb)//계정이 없어서 오로지 하나의 변수
            const document = {
                "id" : req.session.userid,
                "ip" : ip,
                "api" : api,
                "rest" : rest,
                "request" : request,
                "response" : response,
                "time" : currentTime
            }
            await conn.db("healthpartner").collection("log").insertOne(document)
            result.success = true
        }
    }catch(err){
        console.log(`POST log Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        result.message = err.message
    }finally{
        if(conn) conn.close()
    }
}

module.exports = {logging}