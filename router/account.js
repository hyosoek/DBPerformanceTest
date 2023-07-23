const router = require("express").Router()
const inputCheck = require("../module/inputCheck.js");

const {Client} = require("pg")
const db = require('../database.js');

const logg = require("./log.js");

// 로그인
router.post("/log-in",async(req,res)=>{
    const {id,pw} = req.body;
    const result = {
        "success" : false,
        "message" : "",
        "userNum" : null
    }
    let client = null;
    try{
        const idCheck = new inputCheck(id)
        const pwCheck = new inputCheck(pw)

        if (idCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) throw new Error({"message":idCheck.errMessage})
        if(pwCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) throw new Error({"message":pwCheck.errMessage})
        
        client = new Client(db.pgConnect)
        client.connect()
        const sql = "SELECT name,usernum,isadmin FROM account WHERE id=$1 AND pw = $2;"
        const values = [id,pw]
        const data = await client.query(sql,values)

        const row = data.rows
        if(row.length != 0) {
            result.success  = true
            result.message = "로그인 성공"
            result.userNum = row[0].usernum

            
            if(row[0].isadmin){
                req.session.isAdmin = true
            }else{
                req.session.isAdmin = false
            }
            
            const tempJSON = {
                "id" : result.userNum , //이후에는 req.session.usernum,
                "ip" : req.ip,
                "api" : req.originalUrl, //parsing이 필요할 듯
                "rest" : "POST", //
                "request" : JSON.parse(JSON.stringify(req.body)), // 굳이 안해도 될 거 같은데...
                "response" : result
            }
            logg.postLog(tempJSON.id,tempJSON.ip,tempJSON.api,tempJSON.rest,tempJSON.request,tempJSON.response)

        } else{
            result.message = "해당하는 회원정보가 없습니다."
        }
    }catch(err){
        console.log("POST /account/log-in", err.message)
        result.message = err.message
    } finally{
        if(client) client.end() 
        res.send(result)
    }
       
})
// 회원가입 - 아이디 중복체크
router.get("/id-exist",async(req,res)=>{ //아이디 중복체크
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
            console.log(row)

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
    }
    
})
// 회원가입
router.post("/",async(req,res)=>{
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
    }
})
// 아이디 찾기
router.get("/find-id",async(req,res)=>{
    console.log(req)
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
        if(client)client.end()
        console.log(res)
        res.send(result)
    }
        

})
// 비번찾기 - 신원확인
router.get("/certification",async(req,res)=>{
    const {id,name,mail} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "usernum" : null
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
                result.usernum = row[0].usernum
                result.success  = true
                result.message = "귀하의 아이디를 찾았습니다."
            } else{
                result.message = "존재하지 않는 정보입니다."
            }
        }
    }catch(err){
        console.log("GET /account/certification",err.message)
        result.message = err.message
    } finally{
        if(client)client.end()
        res.send(result)
    }
   
})
// 비번찾기 - 비번변경
router.put("/modify-pw",async(req,res)=>{
    const {usernum,newpw1,newpw2} = req.body; // 받아옴
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const numCheck = new inputCheck(usernum)
        const pwCheck = new inputCheck(newpw1)

        if(pwCheck.isMinSize(4).isMaxSize(31).isSameWith(newpw2).isEmpty().result != true) result.message = pwCheck.errMessage
        else if(numCheck.isEmpty()) result.message = numCheck.errMessage
        else {
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "UPDATE account SET pw = $1 WHERE usernum = $2;"
            const values = [newpw1,usernum]
            const data = await client.query(sql,values)

            result.success  = true
            result.message = "비밀번호 변경 완료"
        }
    }catch(err){
        console.log("PUT /account/modify-pw",err.message)
        result.message = err.message
    }finally{
        if(client)client.end()
        res.send(result)
    }
    
})
// 계정삭제
router.delete("/",async(req,res)=>{
    const {usernum,pw} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const numCheck = new inputCheck(usernum)
        const pwCheck = new inputCheck(pw)

        if(pwCheck.isMinSize(4).isMaxSize(31).isEmpty().result != true) result.message = pwCheck.errMessage
        else if(numCheck.isEmpty()) result.message = numCheck.errMessage
        else {
            client = new Client(db.pgConnect)
            client.connect()
            const sql = "DELETE FROM account WHERE usernum = $1 AND pw = $2;"
            const values = [usernum,pw]
            const data = await client.query(sql,values)

            result.success  = true
            result.message = "계정 삭제 완료"
        }
    }catch(err){
        console.log("DELETE /account",err.message)
        result.message = err.message
    } finally{
        if(client) client.end()
        res.send(result)
    }
    
})


module.exports = router