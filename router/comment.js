const router = require("express").Router()
const connection = require('../database.js');
const regex = require('./regex.js');
const dateParse = require('./dateParse.js');


// 코멘트 페이지 개수 가져오기
router.get("/count/:commentperpage/:postnum",(req,res)=>{
    const {commentperpage,postnum} = req.params
    const result = {
        "success" : false,
        "message" : "",
        "pagecount":null
    }
    connection.query(`SELECT COUNT(*) AS count FROM comment WHERE postnum = ${postnum};`,function(error,data){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            result.success = true
            result.pagecount = parseInt(((data[0].count)-1)/commentperpage) +1
            result.message = "총 코멘트 페이지 수입니다."
            res.send(result)
        }
    })
})
// 코멘트 페이지 단위로 가져오기
router.get("/:postnum/:commentpagenum/:commentperpage",(req,res)=>{
    const {postnum,commentpagenum,commentperpage} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "commentList": []
    }
    connection.query(`SELECT detail,date,name,commentnum,user.usernum FROM comment 
    JOIN user ON comment.usernum = user.usernum
    WHERE postnum = ${postnum} 
    ORDER BY commentnum ASC LIMIT ${commentperpage}
    OFFSET ${(commentpagenum-1)*commentperpage};`,function(error,data){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            if(data.length){
                result.success = true
                result.message = "댓글 목록"
                data.forEach((elem)=>elem.date = dateParse.parseYMDHM(elem.date))
                result.commentList = data
                res.send(result)
            }
            else{
                result.message = "정보가 존재하지 않습니다."
                res.send(result)
            }
        }
    })
})
// commentWrite
router.post("/",(req,res)=>{
    const {detail,usernum,postnum} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : "",
    }
    if(!regex.commentDetailRegex.test(detail)){
        result.message = "내용 정규표현식 오류"
        res.send(result)
    } else{
        connection.query(`INSERT INTO comment(detail,usernum,postnum) VALUES('${detail}','${usernum}',${postnum});`,function(error){
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
// commentFix
router.put("/",(req,res)=>{
    const {detail,commentnum,usernum} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : "",
    }
    if(!regex.commentDetailRegex.test(detail)){
        result.message = "내용 정규표현식 오류"
        res.send(result)
    } else{
        connection.query(`UPDATE comment SET detail = '${detail}' WHERE commentnum = ${commentnum} AND usernum = ${usernum};`,function(error){
            //존재하지 않는 것에 대한 예외처리와, 본인 글인지에 대한 확인
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
// commentDelete
router.delete("/",(req,res)=>{
    const {commentnum,usernum} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    connection.query(`DELETE FROM comment WHERE commentnum = ${commentnum} AND usernum = ${usernum};`,function(error){
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