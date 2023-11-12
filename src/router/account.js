const router = require("express").Router()
const inputCheck = require("../module/inputCheck.js");

const {Client} = require("pg")
const db = require('../../config/database.js');
const verify = require("../middleware/tokenVerify.js");
const auth = require('../middleware/authorization.js');
const redis = require("redis").createClient();

const mailCertification = require('../module/mailCertification.js');

// 로그인

router.post("/log-in",async(req,res,next)=>{
    const {mail,pw} = req.body;
    const result = {
        "success" : false,
        "message" : "",
        "token" : null
    }
    let client = null;
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        inputCheck(pw).isMinSize(4).isMaxSize(31).isEmpty()

        client = new Client(db.pgConnect)
        client.connect()
        const sql = `SELECT id FROM account WHERE mail=$1 AND pw = $2;`
        const values = [mail,pw]
        const data = await client.query(sql,values)
        const row = data.rows
        
        if(row.length != 0) {
            result.success  = true
            result.token = await verify.publishToken(row[0])
        } else{
            result.message = "No-exist email"
        }
        res.send(result)
    }catch(err){
        console.log("POST /account/log-in", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
        //req.resData = result //for logging
        //next() //이제 log 없어서 필요 없음
    } 
})

router.get("/sign-up/send-mail",async(req,res,next)=>{3
    const { mail } = req.query;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        client = new Client(db.pgConnect)
        client.connect()
        const sql = `SELECT count(*) FROM account WHERE mail=$1;`
        const values = [mail]
        const data = await client.query(sql,values)
        const row = data.rows

        if(row[0].count == 0){
            result.success = true
            mailCertification.sending(mail)
            result.message = "Send Certification Number"
        }else{
            result.message = "Already exist mail"
        }
        res.send(result)
    }catch(err){
        console.log("GET /account/sign-up/send-mail", err.message)
        next(err)
    } finally{
        if(client) client.end()
    }    
})

router.get("/sign-up/certification",async(req,res,next)=>{3
    const { mail,code } = req.query;
    const result = {
        "success" : false,
        "message" : ""
    }
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        inputCheck(code).isMinSize(0).isMaxSize(7).isEmpty()
        const certCheck = await mailCertification.certification(mail,code)
        if(certCheck){
            result.success = true;
            result.message = "Certification Success"
        }else{
            result.message = "Not match code!"
        }
        res.send(result)
    }catch(err){
        console.log("GET /account/sign-up/certification", err.message)
        next(err)
    }
})

router.get("/duplicate-nickname",async(req,res,next)=>{
    const {nickname} = req.query;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(nickname).isMinSize(4).isMaxSize(31).isEmpty()

        client = new Client(db.pgConnect)
        client.connect()
        const sql = `SELECT count(*) FROM account WHERE nickname=$1`
        const values = [nickname]
        const data = await client.query(sql,values)
        const row = data.rows
        
        if(row[0].count != 0) { // 존재하지 않는 
            result.message = "Already exist nickname!"
        } else{
            result.success  = true
        }
        res.send(result)
    }catch(err){
        console.log("GET /account/duplicate-nickname", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
    }
       
})

router.post("/",async(req,res,next)=>{
    const {mail,pw1,pw2,nickname} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        inputCheck(pw1).isMinSize(4).isMaxSize(31).isEmpty().isEqual(pw2)
        inputCheck(nickname).isMinSize(4).isMaxSize(31).isEmpty()

        client = new Client(db.pgConnect)
        client.connect()
        const sql = `INSERT INTO account (mail,pw,nickname) VALUES ($1,$2,$3);` // 트랜잭션 체크를 할까...?
        const values = [mail,pw1,nickname]
        const data = await client.query(sql,values)
        const row = data.rows
        
        result.success = true;
        res.send(result)
    }catch(err){
        if(err.code == "23505") {
            err.status = 422
            err.message = "Data Duplicate!"
        }
        console.log("POST /account", err.message)
        next(err)
    } finally{
        if(client) client.end()
    } 
})

router.get("/log-out",auth.authCheck,async(req,res,next)=>{
    const result = {
        "success" : false,
        "message" : ""
    }
    try{
        throw Error()
    }catch(err){
        err.status = 501;
        err.message = "Log-out function Not exist!"
        console.log("POST /account/log-out", err.message)
        next(err)
    } 
})

router.get("/find-pw/send-mail",async(req,res,next)=>{
    const { mail } = req.query;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        client = new Client(db.pgConnect)
        client.connect()
        const sql = `SELECT count(*) FROM account WHERE mail=$1;`
        const values = [mail]
        const data = await client.query(sql,values)
        const row = data.rows

        if(row[0].count != 0){
            result.success = true
            mailCertification.sending(mail)
            result.message = "Send Certification Number"
        }else{
            result.message = "No exist mail"
        }
        res.send(result)
    }catch(err){
        console.log("GET /account/find-pw/send-mail", err.message)
        next(err)
    } finally{
        if(client) client.end()
    }    
})

// 비번찾기 - 신원확인
router.get("/find-pw/certification",async(req,res,next)=>{
    const {id,name,mail} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "token": null
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
        res.send(result)
    }catch(err){
        console.log("GET /account/certification",err.message)
        next(err)
    } finally{
        if(client) client.end()

        req.resData = result //for logging
        next()
    }
   
})

// 비번찾기 - 비번변경
router.put("/modify-pw",auth.authCheck,async(req,res,next)=>{
    const {newpw1,newpw2} = req.body; // 받아옴
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const pwCheck = new inputCheck(newpw1)
        if(pwCheck.isMinSize(4).isMaxSize(31).isSameWith(newpw2).isEmpty().result != true) result.message = pwCheck.errMessage
        else {
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "UPDATE account SET pw = $1 WHERE usernum = $2;"
            const values = [newpw1,await req.decoded.userNum]
            const data = await client.query(sql,values)
            res.clearCookie("token")
            //token 블랙리스트(blacklist)처리
            await redis.zAdd(process.env.blackList, {"score" : Math.floor(currentTime) ,"value" : req.headers.authorization}); //블랙리스트 삽입

            result.success  = true
            result.message = "비밀번호 변경 완료"
        }
        res.send(result)
    }catch(err){
        console.log("PUT /account/modify-pw",err.message)
        next(err)
    }finally{
        if(client) client.end()

        req.resData = result //for logging
        next()
    }
    
})

// 계정삭제
router.delete("/",auth.authCheck,async(req,res,next)=>{
    const {pw} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const pwCheck = new inputCheck(pw)
        if(pwCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = pwCheck.errMessage
        else {
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "DELETE FROM account WHERE usernum = $1 AND pw = $2;"
            const values = [req.decoded.userNum,pw]
            const data = await client.query(sql,values)
            
            res.clearCookie("token")
            await redis.connect()
            const currentTime = new Date()
            await redis.zAdd(process.env.blackList, {"score" : Math.floor(currentTime) ,"value" : req.headers.authorization}); // 첫반째로 초기화

            result.success  = true
            result.message = "계정 삭제 완료"
        }
        res.send(result)
    }catch(err){
        if(err.constraint === 'new_comment_usernum_fkey' || 'new_post_usernum_fkey'){
            err.status = 409
            err.message = err.constraint + " Error!"
        }
        console.log("DELETE /account",err.message)
        next(err)
    } finally{
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
})


module.exports = router