const router = require("express").Router()

const {Client} = require("pg")
const db = require('../database.js');
const inputCheck = require("../module/inputCheck.js");
const auth = require('../middleware/authorization');

// 프로필보기
router.get("/",auth.userCheck,async(req,res,next)=>{
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
            const usernum = await req.decoded.userNum
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
                const error = new Error("Get Profile Error!")
                error.status = 404
            }
            res.send(result)
        }catch(err){
            console.log("GET /profile",err.message)
            next(err)
        }finally{
            if(client) client.end()    
            req.resData = result //for logging
            next()
        }
})

// 프로필수정
router.put("/",auth.userCheck,async(req,res,next)=>{
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
            const usernum = req.decoded.userNum
            const sql = `UPDATE account SET mail = $1, birth = $2, contact = $3 WHERE usernum = $4;` // 중복은 unique로 잡아줌
            const values = [mail,birth,contact,usernum]
            const data = await client.query(sql,values)
            result.success  = true
            result.message = "프로필정보 수정완료"
        }
        res.send(result)
    }catch(err){
        if(err.constraint == "account_mail_key" || "account_contact_key"){
            err.status = 409
            err.message = "Unique Key Error : " + err.constraint
        }
        console.log("PUT /profile",err.message)
        next(err)
    }finally{
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
})

module.exports = router
