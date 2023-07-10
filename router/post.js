const router = require("express").Router()
const regex = require('./regex.js');
const dateParse = require('./dateParse.js');

const {Client} = require("pg")
const db = require('../database.js');


// load postlist
router.get("/list/:pagenum/:postcount",async(req,res)=>{
    const {pagenum,postcount} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "postList" : []
    }
    if(pagenum.length == 0 || postcount.length == 0){
        result.message == "변수 전달 오류"
        res.send(result) 
    }
    else{
        var client = new Client(db.pgConnect)
        try{
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
            }
            else{
                result.message == "게시글 존재하지 않습ㄴ디ㅏ."
            }
        }catch(err){
            console.log("/post/list",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result) 
    } 
})

// countPage
router.get("/count/:postperpage",async(req,res)=>{
    const {postperpage} = req.params
    const result = {
        "success" : false,
        "message" : "",
        "pagecount":null
    }
    if(postperpage.length == 0){
        result.message == "변수 전달 오류"
        res.send(result) 
    } else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = "SELECT COUNT(*) AS count FROM post;"
            const data = await client.query(sql)

            const row = data.rows
            if(row.length != 0){
                result.success = true
                result.pagecount = parseInt(((row[0].count)-1)/postperpage) +1
                result.message = "총 게시글 페이지 수입니다."
            }else{
                result.message = "게시글이 존재하지 않습니다."
            }
            
        }catch(err){
            console.log("/post/count",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
})
router.get("/certification/:postnum/:usernum",async(req,res)=>{
    const {postnum,usernum} = req.params
    const result = {
        "success" : false,
        "message" : "",
        "user":null
    }
    if(postnum == 0 || usernum == 0){
        result.message == "매개변수 전달 오류"
        res.send(result) 
    }else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `SELECT COUNT(*) AS count FROM post WHERE postnum= $1 AND usernum= $2`
            const value = [postnum,usernum]
            const data = await client.query(sql,value)

            const row = data.rows
            if(row[0].count != 0){
                result.success = true
                console.log(row)
                result.message = "인증확인완료"
                result.user = data
            }else{
                result.message = "자신이 쓴 글이 아니면 수정이 불가합니다."
            }
        }catch(err){
            console.log("/post/certification_",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
})
router.get("/:postnum",async(req,res)=>{
    const {postnum} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "title" : "",
        "detail": "",
        "date" : "",
        "name" : ""
    }
    if(postnum.length == 0){
        result.message == "매개변수 오류"
        res.send(result)
    }else{
        var client = new Client(db.pgConnect)
        try{
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
            }else{
                result.message = "존재하지 않는 글입니다."
            }
        }catch(err){
            console.log("/post",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
})
// postWrite
router.post("/",async(req,res)=>{
    const {title,detail,usernum} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : "",
    }
    if(!regex.postTitleRegex.test(title) || title.length == 0){
        result.message = "제목 정규표현식(길이) 오류"
        res.send(result)
    } else if(!regex.postDetailRegex.test(detail) || title.length == 0){
        result.message = "본문 정규표현식(길이) 오류"
        res.send(result)
    } else if(usernum.length == 0){
        result.message = "유저 식별번호 전달오류"
        res.send(result)
    } else {
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `INSERT INTO post(title,detail,usernum) VALUES($1,$2,$3);`
            const value = [title, detail, usernum];
            const data = await client.query(sql,value)

            result.success = true
            result.message = "게시글 작성 성공"                    
        }catch(err){
            console.log("/post",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
})
// postFix
router.put("/",async(req,res)=>{
    const {usernum,title,detail,postnum} = req.body; // 역시나 예외처리할 때 유저 고유 식별번호를 확인합니다.
    //auto date
    console.log(usernum,title,detail,postnum)
    const result = {
        "success" : false,
        "message" : "",
    }
    if(!regex.postTitleRegex.test(title)){
        result.message = "제목 정규표현식(길이) 오류"
        res.send(result)
    } else if(!regex.postDetailRegex.test(detail)){
        result.message = "본문 정규표현식(길이) 오류"
        res.send(result)
    } else if(postnum.length == 0 || usernum.length == 0){
        result.message = "매개변수 전달 오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `UPDATE post SET title = $1, detail = $2 WHERE postnum = $3 AND usernum = $4;`
            const value = [title, detail, postnum,usernum];
            const data = await client.query(sql,value)

            result.success = true
            result.message = "게시글 수정 성공"                    
        }catch(err){
            console.log("/post",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
    
})
// postDelete
router.delete("/",async(req,res)=>{
    const {usernum,postnum} = req.body; //애초에 프론트엔드에서 예외처리를 해줘도 백엔드에서 한번더 점검해야 합니다.(세션을 통해서)
    console.log("유저번호랑 글 번호입니다@@@@@@@@@")
    console.log(postnum)
    console.log(usernum)
    
    const result = {
        "success" : false,
        "message" : ""
    }
    if(usernum.length == 0 || postnum.length == 0){
        result.message = "매개변수 전달오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `DELETE FROM post WHERE postnum = $1 AND usernum = $2;`
            const value = [postnum,usernum]
            const data = await client.query(sql,value)

            result.success = true
            result.message = "게시글 삭제 성공"                    
        }catch(err){
            console.log("/post",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }   
})



module.exports = router