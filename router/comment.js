const router = require("express").Router()
const regex = require('./regex.js');

const {Client} = require("pg")
const db = require('../database.js');

// 코멘트 페이지 개수 가져오기
router.get("/count/:commentperpage/:postnum",async(req,res)=>{
    const {commentperpage,postnum} = req.params
    const result = {
        "success" : false,
        "message" : "",
        "pagecount":null
    }
    if(commentperpage.length == 0 || postnum.length == 0){
        result.message == "매개변수 전달 오류"
        res.send(result)
    }
    else{
        var client = new Client(db.pgConnect)
        try{
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
        }catch(err){
            console.log("/comment/count",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
    
})
// 코멘트 페이지 단위로 가져오기
router.get("/:postnum/:commentpagenum/:commentperpage",async(req,res)=>{
    const {postnum,commentpagenum,commentperpage} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "commentList": []
    }
    if(postnum.length == 0 || commentpagenum.length == 0 || commentperpage.length == 0){
        result.message ="매개변수 오류입니다."
        res.send(result)
    }
    else{
        var client = new Client(db.pgConnect)
        try{
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
        }catch(err){
            console.log("/comment",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)

    }
})
// commentWrite
router.post("/",async(req,res)=>{
    const {detail,usernum,postnum} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : "",
    }
    if(!regex.commentDetailRegex.test(detail)){
        result.message = "내용 정규표현식 오류"
        res.send(result)
    } else if(usernum.length == 0 || postnum.length == 0){
        result.message = "매개변수 전달 오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `INSERT INTO comment(detail,usernum,postnum) VALUES($1,$2,$3);`
            const value = [detail,usernum,postnum]
            const data = await client.query(sql,value)
            
            result.success = true
            result.message = "작성 완료"
        }catch(err){
            console.log("/comment",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }   
})
// commentFix
router.put("/",async(req,res)=>{
    const {detail,commentnum,usernum} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : "",
    }
    if(!regex.commentDetailRegex.test(detail)){
        result.message = "내용 정규표현식 오류"
        res.send(result)
    }else if(commentnum.length == 0 || usernum.length == 0){
        result.message = "매개변수 전달 오류"
        res.send(result)
    }else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `UPDATE comment SET detail = $1 WHERE commentnum = $2 AND usernum = $3;`
            const value = [detail,commentnum,usernum]
            const data = await client.query(sql,value)
            
            result.success = true
            result.message = "수정 완료"
        }catch(err){
            console.log("/comment",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
})
// commentDelete
router.delete("/",async(req,res)=>{
    const {commentnum,usernum} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    if(commentnum.length == 0 || usernum.length == 0){
        result.message = "매개변수 전달 오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `DELETE FROM comment WHERE commentnum = $1 AND usernum = $2;`
            const value = [commentnum,usernum]
            const data = await client.query(sql,value)
            const row = data.rows;
            console.log(row)
            result.success = true
            result.message = "삭제 완료"
        }catch(err){
            console.log("/comment",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
})


module.exports = router