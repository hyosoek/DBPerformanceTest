const router = require("express").Router()
const regex = require('./regex.js');

const {Client} = require("pg")
const db = require('../database.js');

// 로그인
router.post("/log-in",async(req,res)=>{
    const {id,pw} = req.body;
    const result = {
        "success" : false,
        "message" : "",
        "userNum" : null
    }
    if(!regex.idRegex.test(id) || id.length == 0){
        result.message = "id 입력 오류"
        res.send(result)
    }else if(!regex.pwRegex.test(pw) || pw.length == 0){
        result.message = "pw 입력 오류"
        res.send(result)
    }else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = "SELECT usernum FROM account WHERE id=$1 AND pw = $2;"
            const values = [id,pw]
            const data = await client.query(sql,values)

            const row = data.rows
            if(row.length != 0) {
                result.success  = true
                result.message = "로그인 성공"
                result.userNum = row[0].usernum
            } else{
                result.message = "해당하는 회원정보가 없습니다."
            }
        }catch(err){
            console.log("/account/log-in",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
    
})
// 회원가입 - 아이디 중복체크
router.get("/id-exist/:id",async(req,res)=>{ //아이디 중복체크
    const {id} = req.params;
    const result = {
        "success" : false,
        "message" : ""
    }
    console.log("data"+id)
    if(!regex.idRegex.test(id) || id.length == 0){
        result.message = "id 입력 오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
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
        }catch(err){
            console.log("/account/id-exist",err.message)
            result.message = err.message
        }
        client.end()
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
    if(!regex.idRegex.test(id) || id.length == 0){
        result.message = "id 입력 오류"
        res.send(result)
    } else if(!regex.pwRegex.test(pw1) || pw1.length == 0){
        result.message = "pw 입력 오류"
        res.send(result)
    } else if(!regex.nameRegex.test(name) || name.length == 0){
        result.message = "이름 입력 오류"
        res.send(result)
    } else if(!regex.mailRegex.test(mail) || mail.length == 0){
        result.message = "메일 입력 오류"
        res.send(result)
    } else if(!regex.dateRegex.test(birth) || birth.length == 0){
        result.message = "생일 입력 오류"
        res.send(result)
    } else if(!regex.contactRegex.test(contact) || contact.length == 0){
        result.message = "전화번호 입력 오류"
        res.send(result)
    } else if(pw1 != pw2){
        result.message = "비밀번호 입력 오류"
        res.send(result)
    }
    else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = "INSERT INTO account(id,pw,name,mail,birth,contact) VALUES($1,$2,$3,$4,$5,$6);"
            const values = [id,pw1,name,mail,birth,contact]
            const data = await client.query(sql,values)

            result.success  = true
            result.message = "회원가입 성공" 

        }catch(err){
            console.log("/account",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
       
})
// 아이디 찾기
router.get("/find-id/:name/:mail",async(req,res)=>{
    const {name,mail} = req.params; // 받아옴
    console.log(mail)
    const result = {
        "success" : false,
        "message" : "",
        "id" : ""
    }
    if(!regex.nameRegex.test(name) || name.length == 0){
        result.message = "이름 입력오류"
        res.send(result)
    } else if(!regex.mailRegex.test(mail) || mail.length == 0){
        result.message = "메일 입력오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
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
        }catch(err){
            console.log("/account/find-id",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    } 
})
// 비번찾기 - 신원확인
router.get("/certification/:id/:name/:mail",async(req,res)=>{
    const {id,name,mail} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "usernum" : null
    }
    if(!regex.idRegex.test(id) || id.length == 0){
        result.message = "id 입력오류"
        res.send(result)
    } else if(!regex.nameRegex.test(name) || name.length == 0){
        result.message = "이름 입력오류"
        res.send(result)
    } else if(!regex.mailRegex.test(mail) || mail.length == 0){
        result.message = "메일 입력오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
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
        }catch(err){
            console.log("/account/certification",err.message)
            result.message = err.message
        }
        client.end()
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
    if(!regex.pwRegex.test(newpw1) || newpw1.length ==0 || newpw2.length ==0 || usernum.length == 0 ){
        result.message = "pw 입력 오류"
        res.send(result)
    } else if(newpw1 == newpw2){
        result.message = "비밀번호가 일치하지 않습니다."
        res.send(result)
    }else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = "UPDATE account SET pw = $1 WHERE usernum = $2;"
            const values = [newpw1,usernum]
            const data = await client.query(sql,values)

            result.success  = true
            result.message = "비밀번호 변경 완료"
        }catch(err){
            console.log("/account/modify-pw",err.message)
            result.message = err.message
        }
        client.end()
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
    if(!regex.pwRegex.test(pw) || pw.length == 0){
        result.message = "pw 입력 오류"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = "DELETE FROM account WHERE usernum = $1 AND pw = $2;"
            const values = [usernum,pw]
            const data = await client.query(sql,values)

            result.success  = true
            result.message = "계정 삭제 완료"
        }catch(err){
            console.log("/account",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }
})
// 프로필보기
router.get("/:usernum",async(req,res)=>{
    const {usernum} = req.params; // 어떤 아이디던 usernum을 인지하고 있음(2개의 api)
    const result = {
        "success" : false,
        "message" : "",
        "name" : "",
        "mail": "",
        "birth": "",
        "contact": ""
    }
    var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `SELECT name, mail, TO_CHAR(birth, 'YYYY-MM-DD') AS birth_date, contact
            FROM account
            WHERE usernum = $1;`
            const values = [usernum]
            const data = await client.query(sql,values)

            console.log(data.rows)
            const row = data.rows
            if(row.length != 0) {
                result.name = row[0].name
                result.mail = row[0].mail
                result.birth = row[0].birth_date
                result.contact = row[0].contact
                result.success  = true
                result.message = "귀하의 프로필 정보입니다."
            } else{
                result.message = "존재하지 않는 정보입니다."
            }
        }catch(err){
            console.log("/account_",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
})
// 프로필수정
router.put("/",async(req,res)=>{
    const {usernum,mail,birth,contact} = req.body; // 받아옴
    const result = {
        "success" : false,
        "message" : ""
    }
    if(!regex.mailRegex.test(mail) || mail.length == 0){
        result.message = "메일 입력 오류"
        res.send(result)
    } else if(!regex.dateRegex.test(birth) || birth.length == 0){
        result.message = "날짜 입력 오류 (yyyy-mm-dd)꼴로 적어주세요"
        res.send(result)
    } else if(!regex.contactRegex.test(contact) || birth.length == 0){
        result.message = "전화번호 입력 오류 (숫자만 11자리 적어주세요)"
        res.send(result)
    } else{
        var client = new Client(db.pgConnect)
        try{
            client.connect()
            const sql = `UPDATE account SET mail = $1, birth = $2, contact = $3 WHERE usernum = $4;` // 중복은 unique로 잡아줌
            const values = [mail,birth,contact,usernum]
            const data = await client.query(sql,values)

            result.success  = true
            result.message = "프로필정보 수정완료"
        }catch(err){
            console.log("/account",err.message)
            result.message = err.message
        }
        client.end()
        res.send(result)
    }  
})

module.exports = router