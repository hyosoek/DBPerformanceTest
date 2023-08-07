const router = require("express").Router()
const inputCheck = require("../module/inputCheck.js");

const {Client} = require("pg")
const db = require('../database.js');
const verify = require("../module/verify.js");
const loginCounter = require("../module/loginCounter.js");


// 로그인
router.post("/log-in",async(req,res,next)=>{
    const {id,pw} = req.body;
    const result = {
        "success" : false,
        "message" : "",
        "token" : null,
        "isadmin": false
    }
    let client = null;
    try{
        const idCheck = new inputCheck(id)
        const pwCheck = new inputCheck(pw)
        if (idCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = idCheck.errMessage
        if(pwCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = pwCheck.errMessage
        
        client = new Client(db.pgConnect)
        client.connect()
        const sql = "SELECT id,usernum,isadmin FROM account WHERE id=$1 AND pw = $2;"
        const values = [id,pw]
        const data = await client.query(sql,values)
        const row = data.rows

        if(row.length != 0) {
            result.success  = true
            result.message = "로그인 성공"
            result.token = await verify.publishToken(row[0])
            result.isadmin = row[0].isadmin
            loginCounter.countLogin(parseInt(await row[0].usernum))
        } else{
            result.message = "해당하는 회원정보가 없습니다."
        }

    }catch(err){
        console.log("POST /account/log-in", err.message)
        result.message = err.message
    } finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
       
})
//로그아웃
router.get("/log-out",async(req,res,next)=>{
    const result = {
        "success" : false,
        "message" : "",
        "auth" : false
    }
    try{
        if(!req.decoded) throw new Error('authorization Fail');
        result.auth = true
        result.success = true
        //res.clearCookie("token")
        //토큰 블랙리스트(blacklist) 처리
    }catch(err){
        console.log("POST /account/log-out", err.message)
        result.message = err.message
    } finally{
        res.send(result)

        req.resData = result //for logging
        next()
    }    
})

// 회원가입 - 아이디 중복체크
router.get("/id-exist",async(req,res,next)=>{ //아이디 중복체크
    const {id} = req.query;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        const idCheck = new inputCheck(id)
        if (idCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = idCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "SELECT COUNT(*) AS count FROM account WHERE id=$1;"
            const values = [id]
            const data = await client.query(sql,values)

            const row = data.rows

            if(parseInt(row[0].count) == 0) {
                result.success  = true
                result.message = "사용가능한 아이디입니다."
            } else{
                result.message = "이미 존재하는 id입니다."
            }
        }
    }catch(err){
        console.log("GET /account/id-exist/",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
    
})
// 회원가입
router.post("/",async(req,res,next)=>{
    const {id,pw1,pw2,name,mail,birth,contact} = req.body;
    const result = {
        "success" : false,
        "message" : "",
    }
    let client = null;
    try{
        const idCheck = new inputCheck(id)
        const pwCheck = new inputCheck(pw1)
        const nameCheck = new inputCheck(name)
        const mailCheck = new inputCheck(mail)
        const birthCheck = new inputCheck(birth)
        const contactCheck = new inputCheck(contact)

        if (idCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = idCheck.errMessage
        else if(pwCheck.isMinSize(4).isMaxSize(31).isSameWith(pw2).isEmpty().result != true) result.message = pwCheck.errMessage
        else if(nameCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = nameCheck.errMessage
        else if(mailCheck.isMinSize(4).isMaxSize(31).isMail().isEmpty().result != true) result.message = mailCheck.errMessage
        else if(birthCheck.isMinSize(4).isMaxSize(31).isDate().isEmpty().result != true) result.message = birthCheck.errMessage
        else if(contactCheck.isMinSize(4).isMaxSize(31).isContact().isEmpty().result != true) result.message = contactCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "INSERT INTO account(id,pw,name,mail,birth,contact) VALUES($1,$2,$3,$4,$5,$6);"
            const values = [id,pw1,name,mail,birth,contact]
            const data = await client.query(sql,values)
    
            result.success  = true
            result.message = "회원가입 성공" 
        }
    }catch(err){
        console.log("POST /account",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
})
// 아이디 찾기
router.get("/find-id",async(req,res,next)=>{
    const {name,mail} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "id" : ""
    }
    let client = null
    try{
        const nameCheck = new inputCheck(name)
        const mailCheck = new inputCheck(mail)

        if(nameCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = nameCheck.errMessage
        else if(mailCheck.isMinSize(4).isMaxSize(31).isMail().isEmpty().result != true) result.message = mailCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "SELECT id FROM account WHERE name = $1 AND mail = $2;"
            const values = [name,mail]
            const data = await client.query(sql,values)
    
            const row = data.rows
    
            if(row.length != 0) {
                result.id = row[0].id
                result.success  = true
                result.message = "귀하의 아이디를 찾았습니다."
            } else{
                result.message = "존재하지 않는 정보입니다."
            }
        }
    }catch(err){
        console.log("GET /account/find-id",err.message)
        result.message = err.message
    }finally {
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
        

})
// 비번찾기 - 신원확인
router.get("/certification",async(req,res,next)=>{
    const {id,name,mail} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "token":null
    }
    let client = null
    try{
        const idCheck = new inputCheck(id)
        const nameCheck = new inputCheck(name)
        const mailCheck = new inputCheck(mail)

        if (idCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = idCheck.errMessage
        else if(nameCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = nameCheck.errMessage
        else if(mailCheck.isMinSize(4).isMaxSize(31).isMail().isEmpty().result != true) result.message = mailCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "SELECT usernum FROM account WHERE id = $1 AND name = $2 AND mail = $3;"
            const values = [id,name,mail]
            const data = await client.query(sql,values)
    
            const row = data.rows
            if(row.length != 0) {
                result.success  = true
                result.message = "귀하의 아이디를 찾았습니다."
                result.token = await verify.publishToken(row[0]) // 임시토큰 발행
            } else{
                result.message = "존재하지 않는 정보입니다."
            }
        }
    }catch(err){
        console.log("GET /account/certification",err.message)
        result.message = err.message
    } finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
   
})
// 비번찾기 - 비번변경
router.put("/modify-pw",async(req,res,next)=>{
    const {newpw1,newpw2} = req.body; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "auth" : false
    }
    let client = null
    try{
        if(!req.decoded) throw new Error('authorization Fail');
        result.auth = true

        const pwCheck = new inputCheck(newpw1)
        if(pwCheck.isMinSize(4).isMaxSize(31).isSameWith(newpw2).isEmpty().result != true) result.message = pwCheck.errMessage
        else {
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "UPDATE account SET pw = $1 WHERE usernum = $2;"
            const values = [newpw1,await req.decoded.userNum]
            const data = await client.query(sql,values)
            //res.clearCookie("token")
            //token 블랙리스트(blacklist)처리
            result.success  = true
            result.message = "비밀번호 변경 완료"
        }
    }catch(err){
        console.log("PUT /account/modify-pw",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
    
})
// 계정삭제
router.delete("/",async(req,res,next)=>{
    const {pw} = req.body;
    const result = {
        "success" : false,
        "message" : "",
        "auth" : false
    }
    let client = null
    try{
        if(!req.decoded) throw new Error('authorization Fail');
        result.auth = true

        const pwCheck = new inputCheck(pw)
        if(pwCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = pwCheck.errMessage
        else {
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "DELETE FROM account WHERE usernum = $1 AND pw = $2;"
            const values = [req.decoded.userNum,pw]
            const data = await client.query(sql,values)
            // res.clearCookie("token")
            // token 블랙리스트(blacklist처리) 

            result.success  = true
            result.message = "계정 삭제 완료"
        }
    }catch(err){
        console.log("DELETE /account",err.message)
        result.message = err.message
    } finally{
        if(client) client.end()
        res.send(result)

        req.resData = result //for logging
        next()
    }
})


module.exports = router