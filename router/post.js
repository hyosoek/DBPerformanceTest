const router = require("express").Router()
const dateParse = require('../module/dateParse');
const inputCheck = require("../module/inputCheck.js");

const {Client} = require("pg")
const db = require('../database.js');

const logg = require("./log.js");
const session = require("express-session");


// load postlist
router.get("/list",async(req,res)=>{
    const {pagenum} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "postList" : []
    }
    let client = null
    try{
        const numCheck = new inputCheck(pagenum)

        if (numCheck.isEmpty().result != true) result.message = numCheck.errMessage
        else{
            const postcount = process.env.postPerPage // 환경변수
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `SELECT name,postnum,title,date FROM post 
            JOIN account ON post.usernum = account.usernum
            ORDER BY postnum DESC LIMIT $1 
            OFFSET $2;`
            const values = [postcount,(pagenum-1)*postcount]
            const data = await client.query(sql,values)

            const row = data.rows
            if(row.length != 0){
                result.success = true
                result.message = (pagenum) + "페이지 게시글 가져오기 성공"
                row.forEach((elem)=>elem.date = dateParse.showTimeLapse(elem.date))
                result.postList = row

                const tempJSON = {
                    "id" : req.session.userId, 
                    "ip" : req.ip,
                    "api" : req.originalUrl,
                    "rest" : "GET", //
                    "request" : JSON.parse(JSON.stringify(req.query)), 
                    "response" : result
                }
                logg.postLog(tempJSON.id,tempJSON.ip,tempJSON.api,tempJSON.rest,tempJSON.request,tempJSON.response)
            }
            else{
                result.message == "게시글 존재하지 않습ㄴ디ㅏ."
            }
        }
    }catch(err){
        console.log("GET /post/list",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result) 
    }
})

// countPage
router.get("/count",async(req,res)=>{
    const result = {
        "success" : false,
        "message" : "",
        "pagecount":null
    }
    let client = null
    try{
        const postperpage = process.env.postPerPage // 환경변수
        client = new Client(db.pgConnect)
        client.connect()
        const sql = "SELECT COUNT(*) AS count FROM post;"
        const data = await client.query(sql)

        const row = data.rows
        if(row.length != 0){
            result.success = true
            result.pagecount = parseInt(((row[0].count)-1)/postperpage) +1
            result.message = "총 게시글 페이지 수입니다."

            const tempJSON = {
                "id" : req.session.userId, 
                "ip" : req.ip,
                "api" : req.originalUrl,
                "rest" : "GET", //
                "request" : JSON.parse(JSON.stringify(req.query)), 
                "response" : result
            }
            logg.postLog(tempJSON.id,tempJSON.ip,tempJSON.api,tempJSON.rest,tempJSON.request,tempJSON.response)
        }else{
            result.message = "게시글이 존재하지 않습니다."
        }
        
    }catch(err){
        console.log("GET /post/count",err.message)
        result.message = err.message
    }finally{
        if(client)client.end()
        res.send(result)
    }
})

// getpost
router.get("/",async(req,res)=>{
    const {postnum} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "title" : "",
        "detail": "",
        "date" : "",
        "name" : ""
    }
    let client = null
    try{
        const numCheck = new inputCheck(postnum)

        if (numCheck.isEmpty().result != true) result.message = numCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `SELECT name,postnum,title,date,detail,account.usernum FROM post 
            JOIN account ON post.usernum = account.usernum 
            WHERE postnum = $1;`
            const value = [postnum]
            const data = await client.query(sql,value)

            const row = data.rows
            if(row.length != 0){
                result.success = true
                    result.message = "게시글 가져오기 성공"
                    result.title = row[0].title
                    result.detail = row[0].detail
                    result.date = row[0].date
                    result.name = row[0].name

                    const tempJSON = {
                        "id" : req.session.userId, 
                        "ip" : req.ip,
                        "api" : req.originalUrl,
                        "rest" : "GET", //
                        "request" : JSON.parse(JSON.stringify(req.query)), 
                        "response" : result
                    }
                    logg.postLog(tempJSON.id,tempJSON.ip,tempJSON.api,tempJSON.rest,tempJSON.request,tempJSON.response)
            }else{
                result.message = "존재하지 않는 글입니다."
            }
        }
    }catch(err){
        console.log("GET /post",err.message)
        result.message = err.message
    }finally{
        if(client)client.end()
        res.send(result)
    }
    
})

// postWrite
router.post("/",async(req,res)=>{
    const {title,detail} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : "",
    }
    let client = null
    try{
        const titleCheck = new inputCheck(title)
        const detailCheck = new inputCheck(detail)

        if (titleCheck.isMinSize(4).isMaxSize(63).isEmpty().result != true) result.message = titleCheck.errMessage
        else if (detailCheck.isMinSize(4).isMaxSize(2047).isEmpty().result != true) result.message = detailCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = await req.session.userNum
            const sql = `INSERT INTO post(title,detail,usernum) VALUES($1,$2,$3);`
            const value = [title, detail, usernum];
            const data = await client.query(sql,value)
    
            result.success = true
            result.message = "게시글 작성 성공" 

            const tempJSON = {
                "id" : req.session.userId, 
                "ip" : req.ip,
                "api" : req.originalUrl,
                "rest" : "POST", //
                "request" : JSON.parse(JSON.stringify(req.body)), 
                "response" : result
            }
            logg.postLog(tempJSON.id,tempJSON.ip,tempJSON.api,tempJSON.rest,tempJSON.request,tempJSON.response)
        }            
    }catch(err){
        console.log("POST /post",err.message)
        result.message = err.message
    } finally{
        if(client)client.end()
        res.send(result)
    }
    
})

// postFix
router.put("/",async(req,res)=>{
    const {title,detail,postnum} = req.body; // 역시나 예외처리할 때 유저 고유 식별번호를 확인합니다.
    const result = {
        "success" : false,
        "message" : "",
    }
    let client = null
    try{
        const titleCheck = new inputCheck(title)
        const detailCheck = new inputCheck(detail)
        const numCheck2 = new inputCheck(postnum)

        if (titleCheck.isMinSize(4).isMaxSize(63).isEmpty().result != true) result.message = titleCheck.errMessage
        else if (detailCheck.isMinSize(4).isMaxSize(2047).isEmpty().result != true) result.message = detailCheck.errMessage
        else if (numCheck2.isEmpty().result != true) result.message = numCheck2.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = await req.session.userNum
            const sql = `UPDATE post SET title = $1, detail = $2 WHERE postnum = $3 AND usernum = $4;`
            const value = [title, detail, postnum,usernum];
            const data = await client.query(sql,value)

            result.success = true
            result.message = "게시글 수정 성공" 

            const tempJSON = {
                "id" : req.session.userId, 
                "ip" : req.ip,
                "api" : req.originalUrl,
                "rest" : "PUT", //
                "request" : JSON.parse(JSON.stringify(req.body)), 
                "response" : result
            }
            logg.postLog(tempJSON.id,tempJSON.ip,tempJSON.api,tempJSON.rest,tempJSON.request,tempJSON.response)
        }                   
    }catch(err){
        console.log("PUT /post",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)
    }
    
    
})

// postDelete
router.delete("/",async(req,res)=>{
    const {postnum} = req.body; //애초에 프론트엔드에서 예외처리를 해줘도 백엔드에서 한번더 점검해야 합니다.(세션을 통해서)    
    const result = {
        "success" : false,
        "message" : ""
    }
    var client = null
    try{
        const numCheck = new inputCheck(postnum)
        if (numCheck.isEmpty().result != true) result.message = numCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `DELETE FROM post WHERE postnum = $1 AND usernum = $2;`
            const usernum = await req.session.userNum
            const value = [postnum,usernum]
            console.log(postnum,usernum)
            const data = await client.query(sql,value)

            result.success = true
            result.message = "게시글 삭제 성공"  

            const tempJSON = {
                "id" : req.session.userId, 
                "ip" : req.ip,
                "api" : req.originalUrl,
                "rest" : "DELETE", //
                "request" : JSON.parse(JSON.stringify(req.body)), 
                "response" : result
            }
            logg.postLog(tempJSON.id,tempJSON.ip,tempJSON.api,tempJSON.rest,tempJSON.request,tempJSON.response)
        }                  
    }catch(err){
        console.log("/post",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)
    }
})



module.exports = router