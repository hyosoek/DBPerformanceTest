const router = require("express").Router()

const {Client} = require("pg")
const db = require('../database.js');
const inputCheck = require("../module/inputCheck.js");

// 프로필보기
router.get("/",async(req,res)=>{
    const result = {
        "success" : false,
        "message" : "",
        "name" : "",
        "mail": "",
        "birth": "",
        "contact": ""
    }
    let client = null
        try{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = await req.session.userNum
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
            console.log("GET /profile",err.message)
            result.message = err.message
        }finally{
            if(client)client.end()
            res.send(result)
        }
})

// 프로필수정
router.put("/",async(req,res)=>{
    const {mail,birth,contact} = req.body; // 받아옴
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const mailCheck = new inputCheck(mail)
        const birthCheck = new inputCheck(birth)
        const contactCheck = new inputCheck(contact)

        if(mailCheck.isMinSize(4).isMaxSize(31).isMail().isEmpty().result != true) result.message = mailCheck.errMessage
        else if(birthCheck.isMinSize(4).isMaxSize(31).isDate().isEmpty().result != true) result.message = birthCheck.errMessage
        else if(contactCheck.isMinSize(4).isMaxSize(31).isContact().isEmpty().result != true) result.message = contactCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = req.session.userNum
            const sql = `UPDATE account SET mail = $1, birth = $2, contact = $3 WHERE usernum = $4;` // 중복은 unique로 잡아줌
            const values = [mail,birth,contact,usernum]
            const data = await client.query(sql,values)

            result.success  = true
            result.message = "프로필정보 수정완료"
        }
        
    }catch(err){
        console.log("PUT /profile",err.message)
        result.message = err.message
    }finally{
        if(client)client.end()
        res.send(result) 
    }
})

module.exports = router
