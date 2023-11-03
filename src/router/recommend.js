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

module.exports = router
