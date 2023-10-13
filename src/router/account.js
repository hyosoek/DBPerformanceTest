const router = require("express").Router()
const inputCheck = require("../module/inputCheck.js");

const {Client} = require("pg")
const db = require('../database.js');
const verify = require("../middleware/verify.js");
const loginCounter = require("../module/loginCounter.js");
const auth = require('../middleware/authorization');
const redis = require("redis").createClient();



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
        const mailCheck = new inputCheck(mail)
        const pwCheck = new inputCheck(pw)
        if (mailCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = mailCheck.errMessage
        if(pwCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = pwCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "SELECT id FROM account WHERE mail=$1 AND pw = $2;"
            const values = [mail,pw]
            const data = await client.query(sql,values)
            const row = data.rows
    
            if(row.length != 0) {
                result.success  = true
                result.message = "로그인 성공"
                // result.token = await verify.publishToken(row[0])
            } else{
                result.message = "로그인 실패"
            }
        }
        res.send(result)
    }catch(err){
        console.log("POST /account/log-in", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
       
})
//로그아웃
router.get("/log-out",auth.authCheck,async(req,res,next)=>{
    const result = {
        "success" : false,
        "message" : ""
    }
    try{
        result.success = true
        res.clearCookie("token")

        await redis.connect()
        const currentTime = new Date()
        await redis.zAdd(process.env.blackList, {"score" : Math.floor(currentTime) ,"value" : req.headers.authorization}); //블랙리스트 삽입

        //토큰 블랙리스트(blacklist) 처리
        res.send(result)
    }catch(err){
        console.log("POST /account/log-out", err.message)
        next(err)
    } finally{
        redis.disconnect()
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
        res.send(result)
    }catch(err){
        console.log("GET /account/id-exist/",err.message)
        result.message = err.message
    }finally{
        if(client) client.end()
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
        res.send(result)
    }catch(err){
        if(err.code == 23505){
            err.status = 409
            err.message = "Unique Value Fail!"
        } // unique fail이 아니면, 자동으로 500처리
        console.log("POST /account",err.message)
        next(err)
    }finally{
        if(client) client.end()
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
        res.send(result)
    }catch(err){
        console.log("GET /account/find-id",err.message)
        next(err)
    }finally {
        if(client) client.end()

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