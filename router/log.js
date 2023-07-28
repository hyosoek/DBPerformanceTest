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
        else{
            const currentTime = new Date();
            conn  = await client.connect(process.env.mongoDb)//계정이 없어서 오로지 하나의 변수
            const document = {
                "id" : id,
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
        return result
    }
}

router.get("/",async(req,res) =>{
    const {newest,id,pagenum} = req.query;
    const result = {
        "success" :false,
        "message" :null,
        "data" :null
    }
    
    let conn = null //중요!
    try{
        const newestCheck = new inputCheck(newest)
        const idCheck = new inputCheck(id)
        const pagenumCheck = new inputCheck(pagenum)

        if (newestCheck.isEmpty().result != true) result.message = newestCheck.errMessage
        else if (idCheck.isNull().isUndefined().result != true) result.message = idCheck.errMessage // isIP 넣어야할 듯
        else if (pagenumCheck.isEmpty().result != true) result.message = pagenumCheck.errMessage
        else{
            conn  = await client.connect(process.env.mongoDb)//계정이 없어서 오로지 하나의 변수
            let isNewest = null;

            isNewest = parseInt(newest) * (-1)

            let data = null

            if(id == ""){
                data = await conn.db("healthpartner")
                .collection("log")
                .find()
                .skip((pagenum-1)*process.env.logPerPage)
                .limit(parseInt(process.env.logPerPage))
                .sort({ time: isNewest })
                .toArray()
            } else {
                data = await conn.db("healthpartner")
                .collection("log")
                .find({"id": id})
                .skip((pagenum-1)*process.env.logPerPage)
                .limit(parseInt(process.env.logPerPage))
                .sort({ time: isNewest })
                .toArray()
            }

            result.data = data
            result.success = true
        }
    }catch(err){
        console.log(`POST /chat Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        result.message = err.message
    }finally{
        if(conn) conn.close()
        res.send(result)
    }
})

router.get("/maxpage",async(req,res) =>{
    const {id} = req.query;
    const result = {
        "success" :false,
        "message" :null,
        "maxpage" :null
    }
    
    let conn = null //중요!
    try{
        const idCheck = new inputCheck(id)
        if (idCheck.isNull().isUndefined().result != true) result.message = idCheck.errMessage
        else{
            conn  = await client.connect(process.env.mongoDb)//계정이 없어서 오로지 하나의 변수

            let count = null
            if(id == ""){
                count = await conn.db("healthpartner")
                .collection("log")
                .countDocuments();
            } else {
                const condition = { "id":id };
                count = await conn.db("healthpartner")
                .collection("log")
                .countDocuments(condition);
            }
            console.log(count)

            result.maxpage = Math.ceil(count / process.env.logPerPage);
            result.success = true
            console.log("success!")
        }
    }catch(err){
        console.log(`POST /chat Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        result.message = err.message
    }finally{
        if(conn) conn.close()
        res.send(result)
    }
})


module.exports = { router, postLog }