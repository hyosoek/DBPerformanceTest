const router = require("express").Router()
const client = require("mongodb").MongoClient

const inputCheck = require("../module/inputCheck.js");

const postLog = async(id,ip,api,rest,request,response) =>{
    console.log("init postLog success")
    const result = {
                "success" :false,
                "message" :null
            }
    let conn = null //중요!
    try{
        const idCheck = new inputCheck(id)
        const ipCheck = new inputCheck(ip)
        const apiCheck = new inputCheck(api)
        const restCheck = new inputCheck(rest)
        const requestCheck = new inputCheck(request)
        const responseCheck = new inputCheck(response)

        if (idCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = idCheck.errMessage
        else if (ipCheck.isEmpty().result != true) result.message = ipCheck.errMessage // isIP 넣어야할 듯
        else if (apiCheck.isMinSize(1).isMaxSize(1023).isEmpty().result != true) result.message = apiCheck.errMessage
        else if (restCheck.isMinSize(1).isMaxSize(10).isEmpty().result != true) result.message = restCheck.errMessage
        else if (requestCheck.isEmpty().result != true) result.message = requestCheck.errMessage
        else if (responseCheck.isEmpty().result != true) result.message = responseCheck.errMessage

        conn  = await client.connect("mongodb://localhost:27017")//계정이 없어서 오로지 하나의 변수
        const document = {
            "id" : id,
            "ip" : ip,
            "api" : api,
            "rest" : rest,
            "request" : request,
            "response" : response
        }
        await conn.db("healthpartner").collection("log").insertOne(document)
        result.success = true

    }catch(err){
        console.log(`POST log Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        result.message = err.message
    }finally{
        if(conn) conn.close()
        return result
    }
}

router.get("/",async(req,res) =>{
    console.log("real success")
    const result = {
        "success" :false,
        "message" :null,
        "data" :null
    }
    
    let conn = null //중요!
    try{
        conn  = await client.connect("mongodb://localhost:27017")//계정이 없어서 오로지 하나의 변수
        const data = await conn.db("healthpartner").collection("log").find().toArray()
        result.data = data
        result.success = true
        console.log("success!")
    }catch(err){
        console.log(`POST /chat Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        result.message = err.message
    }finally{
        if(conn) conn.close()
        res.send(result)
    }
})



module.exports = { router, postLog }