const router = require("express").Router()
const connection = require('../database.js');
const regex = require('./regex.js');
const dateParse = require('./dateParse.js');


// load postlist
router.get("/list/:pagenum/:postcount",(req,res)=>{
    const {pagenum,postcount} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "postList" : [],
        "pageNum" : null
    }
    const sql = `SELECT name,postnum,title,date FROM post 
    JOIN user ON post.usernum = user.usernum
    ORDER BY postnum DESC LIMIT ? 
    OFFSET ?;`
    const sqlValue = [postcount,(pagenum-1)*postcount]
    connection.query(sql,sqlValue,function(error,data){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            if(data.length >=1){
                result.success = true
                result.message = (pagenum) + "페이지 게시글 가져오기 성공"
                result.postList = data
                console.log(data)
                data.forEach((elem)=>elem.date = dateParse.showTimeLapse(elem.date))
                res.send(result)
            }
            else{
                result.message = "존재하지 않는 정보입니다."
                res.send(result)
            }
        }
    })
})
// countPage
router.get("/count/:postperpage",(req,res)=>{
    const {postperpage} = req.params
    const result = {
        "success" : false,
        "message" : "",
        "pagecount":null
    }
    connection.query(`SELECT COUNT(*) AS count FROM post;`,function(error,data){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            result.success = true
            result.pagecount = parseInt(((data[0].count)-1)/postperpage) +1
            result.message = "총 게시글 페이지 수입니다."
            res.send(result)
        }
    })
})
router.get("/certification/:postnum/:usernum",(req,res)=>{
    const {postnum,usernum} = req.params
    const result = {
        "success" : false,
        "message" : "",
        "user":null
    }
    const sql = `SELECT COUNT(*) AS count FROM post WHERE postnum= ? AND usernum= ?`
    const sqlValue = [postnum,usernum]
    connection.query(sql,sqlValue,function(error,data){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            if(data.count){
                result.success = true
                result.message = "인증확인완료"
                result.user = data
                res.send(result)
            }
            else{
                result.message = "자신이 쓴 글이 아니면 수정 불가합니다."
                res.send(result)
            }
        }
    })
})
router.get("/:postnum",(req,res)=>{
    const {postnum} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "title" : "",
        "detail": "",
        "date" : "",
        "name" : ""
    }
    const sql = `SELECT name,postnum,title,date,detail,user.usernum FROM post 
    JOIN user ON post.usernum = user.usernum 
    WHERE postnum = ?;`
    const sqlValue = [postnum]
    connection.query(sql,sqlValue,function(error,data1){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            if(data1.length >=1){
                if(data1.length == 1){
                    result.success = true
                    result.message = "게시글 가져오기 성공"
                    result.title = data1[0].title
                    result.detail = data1[0].detail
                    result.date = dateParse.parseYMD(data1[0].date)
                    result.name = data1[0].name
                    res.send(result)
                }
                else{
                    result.message = "오류. 관리자께 문의하세요"
                    res.send(result)
                }
            }
            else{
                result.message = "존재하지 않는 글입니다."
                res.send(result)
            }
        }
    })
})
// postWrite
router.post("/",(req,res)=>{
    const {title,detail,usernum} = req.body;
    //auto date
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
    } else {
        const sql = "INSERT INTO post(title,detail,usernum) VALUES(?,?,?);"
        const values = [title, detail, usernum];
        connection.query(sql,values,function(error){
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                result.success = true
                result.message = "작성 완료"
                res.send(result)
            }
        }) 
    }
     
})
// postFix
router.put("/",(req,res)=>{
    const {title,detail,postnum} = req.body;
    //auto date
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
    } else{
        const sql = "UPDATE post SET title = ?, detail = ? WHERE postnum = ?;"
        const values = [title,detail,postnum]
        connection.query(sql,values,function(error){
            //본인확인
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                result.success = true
                result.message = "수정 완료"
                res.send(result)
            }
        })
    }
    
})
// postDelete
router.delete("/",(req,res)=>{
    const {postnum} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    const sql = `DELETE FROM post WHERE postnum = ?;`
    const sqlValue = [postnum]
    connection.query(sql,sqlValue,function(error){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            result.success = true
            result.message = "삭제 성공"
            res.send(result)
        }
    })
})



module.exports = router