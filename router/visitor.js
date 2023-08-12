const router = require("express").Router()
const {Client} = require("pg")
const db = require('../database.js');

const loginCounter = require("../module/loginCounter.js");
const auth = require("../middleware/authorization.js")

// 로그인한 사람 수
router.get("/",auth.adminCheck,async(req,res,next)=>{
    const result = {
        "success" : false,
        "message" : "",
        "todaycount" : null,
        "totalcount" : null
    }
    let client = null
        try{
            client = new Client(db.pgConnect)
            client.connect()
            const currentTime = new Date();
            const currentDate = currentTime.toISOString().slice(0, 10);
            const sql = `SELECT SUM(count) AS total_count
                        FROM logincount
                        WHERE date_col = $1
                        UNION
                        SELECT SUM(count) AS total_count
                        FROM logincount;`
            const values = [currentDate]
            const data = await client.query(sql,values)
            const row = data.rows

            if(row.length != 0) {
                result.success  = true
                result.message = `${currentDate}의 로그인기록입니다.`
                const redisData = await loginCounter.showMemoryCount()
                result.todaycount = parseInt(row[0].total_count) + redisData
                result.totalcount = parseInt(row[1].total_count) + redisData
            } else{
                result.message = "존재하지 않는 데이터입니다."
            }
            
        }catch(err){
            console.log("GET /visitor",err.message)
            result.message = err.message
        }finally{
            if(client) client.end()
            res.send(result)
    
            req.resData = result //for logging
            next()
        }
})

module.exports = router
