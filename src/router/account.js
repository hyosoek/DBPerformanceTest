require('dotenv').config({ path: "../../.env" });
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
        const sql = `SELECT id 
                    FROM account 
                    WHERE mail=$1 AND pw = $2;`
        const values = [mail,pw]
        const data = await client.query(sql,values)
        const row = data.rows
        
        if(row.length != 0) {
            result.success  = true
            result.token = await verify.publishToken(row[0])
        } else{
            result.message = "Log-in Fail"
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
        const sql = `SELECT count(*) 
                    FROM account 
                    WHERE mail=$1;`
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
            await redis.connect();
            await redis.expire(mail+process.env.mailCert, process.env.signUpExpireTime); // 코드 유효시간 5분으로 리셋 =>
            redis.disconnect() 

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
        const sql = `SELECT count(*) 
                    FROM account 
                    WHERE nickname=$1`
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
    //duplicate는 unique라서 자동으로 되는 듯, 인증코드만 받으면 되는데,
    const {mail,pw1,pw2,nickname,code,longitude,latitude} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        inputCheck(pw1).isMinSize(4).isMaxSize(31).isEmpty().isEqual(pw2)
        inputCheck(nickname).isMinSize(4).isMaxSize(31).isEmpty()
        inputCheck(longitude).isEmpty()
        inputCheck(latitude).isEmpty()
        inputCheck(code).isMinSize(5).isMaxSize(7).isEmpty()

        await redis.connect();
        const redisData = await redis.get(mail+process.env.mailCert) // 아까의 인증 번호 = 신원확인 + 비밀번호 바꿀 권한 둘다 쓰는거(시점만 다른 거라 생각)

        console.log(redisData)

        if(redisData == code){
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `INSERT INTO account (mail,pw,nickname,longitude,latitude) 
                        VALUES ($1,$2,$3,$4,$5);` //여기서 duplicate 체크
            const values = [mail,pw1,nickname,longitude,latitude]
            const data = await client.query(sql,values)
            await redis.expire(mail+process.env.mailCert, "0")
            
            result.success = true;
            res.send(result)
        }else{
            const error = new Error();
            error.status = 403;
            error.message = "Athentication Fail!";
            throw error
        }
        
    }catch(err){
        if(err.code == "23505") {
            err.status = 422
            err.message = "Data Duplicate!"
        }
        console.log("POST /account", err.message)
        next(err)
    } finally{
        redis.disconnect()
        if(client) client.end()
    } 
})

router.get("/log-out",async(req,res,next)=>{
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
        const sql = `SELECT count(*) 
                    FROM account 
                    WHERE mail=$1;`
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
    const { mail,code } = req.query;
    const result = {
        "success" : false,
        "message" : ""
    }
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        inputCheck(code).isMinSize(0).isMaxSize(7).isEmpty()
        const certCheck = await mailCertification.certification(mail,code)
        if(certCheck){ // 메일 인증에 성공하면
            //새로 
            await redis.connect();
            await redis.expire(mail+process.env.mailCert, process.env.changePwExpireTime); // 5분동안 비번 변경 가능
            redis.disconnect() 

            result.success = true;
            result.message = "Certification Success, You can change Pw!"
        }else{
            result.message = "Not match code!"
        }
        res.send(result)
    }catch(err){
        console.log("GET /account/find-pw/certification", err.message)
        next(err)
    }
})

// 비번찾기 - 비번변경
router.put("/pw",async(req,res,next)=>{
    const {mail,pw1,pw2,code} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        inputCheck(pw1).isMinSize(4).isMaxSize(31).isEmpty().isEqual(pw2)
        inputCheck(code).isMinSize(5).isMaxSize(7).isEmpty()

        await redis.connect();
        const redisData = await redis.get(mail+process.env.mailCert)

        if(redisData == code){
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `UPDATE account 
                        SET pw=$1 
                        WHERE mail=$2;` // 트랜잭션 체크를 할까...?
            const values = [pw1,mail]
            const data = await client.query(sql,values)
            await redis.expire(mail+process.env.mailCert, "0")

            result.success = true;
            res.send(result)
        }else{
            const error = new Error();
            error.status = 403;
            error.message="Athentication Fail!";
            throw error;
        }
    }catch(err){
        console.log("PUT /account/pw", err.message)
        next(err)
    } finally{
        redis.disconnect()
        if(client) client.end()
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
        const userId = req.decoded.id;
        inputCheck(pw).isMinSize(4).isMaxSize(31).isEmpty()
        client = new Client(db.pgConnect)
        client.connect()
        const sql = `DELETE FROM account 
                    WHERE id=$1 AND pw = $2`
        const values = [userId,pw]
        const data = await client.query(sql,values)
        if(data.rowCount != 0){
            result.success = true;
            result.message = "Delete Finish!"
        }else{
            result.message = "Delete Fail, Check Pw or Other..."
        }
        res.send(result)
    }catch(err){
        console.log("DELETE /account", err.message)
        next(err)
    } finally{
        if(client) client.end()
    }
})


module.exports = router