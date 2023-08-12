const router = require("express").Router()
const inputCheck = require("../module/inputCheck.js");

const {Client} = require("pg")
const db = require('../database.js');
const auth = require('../middleware/authorization');


// 코멘트 페이지 개수 가져오기
router.get("/count",auth.userCheck,async(req,res,next)=>{
    const {postnum} = req.query
    const result = {
        "success" : false,
        "message" : "",
        "pagecount":null
    }
    let client = null
    try{
        const numCheck = new inputCheck(postnum)
        if (numCheck.isEmpty().result != true) result.message = numCheck.errMessage
        else{
            const commentperpage = process.env.commentPerPage // 환경변수
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `SELECT COUNT(*) AS count FROM comment WHERE postnum = $1;`
            const values = [postnum]
            const data = await client.query(sql,values)

            const row = data.rows
            if(row.length != 0){
                result.success = true
                result.pagecount = parseInt(((row[0].count)-1)/commentperpage) +1
                result.message = "총 코멘트 페이지 수입니다."
            }
            else{
                result.message == "댓글이 존재하지 않습니다."
            }
        }
    }catch(err){
        console.log("GET /comment/count",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
})
// 코멘트 페이지 단위로 가져오기
router.get("/",auth.userCheck,async(req,res,next)=>{
    const {postnum,commentpagenum} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "commentList": []
    }
    let client = null
    try{
        const numCheck1 = new inputCheck(postnum)
        const numCheck2 = new inputCheck(commentpagenum)
        if (numCheck1.isEmpty().result != true) result.message = numCheck1.errMessage
        else if (numCheck2.isEmpty().result != true) result.message = numCheck2.errMessage
        else{
            const commentperpage = process.env.commentPerPage // 환경변수
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `SELECT detail,date,name,commentnum,account.usernum FROM comment 
            JOIN account ON comment.usernum = account.usernum
            WHERE postnum = $1
            ORDER BY commentnum ASC LIMIT $2
            OFFSET $3;`
            const values = [postnum, commentperpage, (commentpagenum-1)*commentperpage]
            const data = await client.query(sql,values)
    
            const row = data.rows
            if(row.length != 0){
                result.success = true
                result.message = "댓글 목록"
                //data.forEach((elem)=>elem.date = dateParse.parseYMDHM(elem.date))
                result.commentList = row
            }
            else{
                result.message == "댓글이 존재하지 않습니다."
            }
        }
    }catch(err){
        console.log("GET /comment",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
    
})
// commentWrite
router.post("/",auth.userCheck,async(req,res,next)=>{
    const {detail,postnum} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const detailCheck = new inputCheck(detail)
        const numCheck2 = new inputCheck(postnum)
        if (detailCheck.isMinSize(2).isMaxSize(1023).isEmpty().result != true) result.message = detailCheck.errMessage
        else if (numCheck2.isEmpty().result != true) result.message = numCheck2.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = await req.decoded.userNum
            const sql = `INSERT INTO comment(detail,usernum,postnum) VALUES($1,$2,$3);`
            const value = [detail,usernum,postnum]
            const data = await client.query(sql,value)
            
            result.success = true
            result.message = "작성 완료"
        }

    }catch(err){
        console.log("POST /comment",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
})
// commentFix
router.put("/",auth.userCheck,async(req,res,next)=>{
    const {detail,commentnum} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const detailCheck = new inputCheck(detail)
        const numCheck1 = new inputCheck(commentnum)
        if (detailCheck.isMinSize(2).isMaxSize(1023).isEmpty().result != true) result.message = detailCheck.errMessage
        else if (numCheck1.isEmpty().result != true) result.message = numCheck1.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = await req.decoded.userNum
            const sql = `UPDATE comment SET detail = $1 WHERE commentnum = $2 AND usernum = $3;`
            const value = [detail,commentnum,usernum]
            const data = await client.query(sql,value)
            
            result.success = true
            result.message = "수정 완료"
        }
    }catch(err){
        console.log("PUT /comment",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
    
})
// commentDelete
router.delete("/",auth.userCheck,async(req,res,next)=>{
    const {commentnum} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    var client = null
    try{
        const numCheck1 = new inputCheck(commentnum)
        if (numCheck1.isEmpty().result != true) result.message = numCheck1.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = req.decoded.userNum
            const sql = `DELETE FROM comment WHERE commentnum = $1 AND usernum = $2;`
            const value = [commentnum,usernum]
            const data = await client.query(sql,value)
            const row = data.rows;
            console.log(row)
            result.success = true
            result.message = "삭제 완료"

        }
    }catch(err){
        console.log("DELETE /comment",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
})


module.exports = router