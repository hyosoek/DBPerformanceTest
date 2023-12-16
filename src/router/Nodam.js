const inputCheck = require("../module/inputCheck.js")

const router = require("express").Router()
const {Client} = require("pg")
const db = require('../../config/database.js');
const redis =require("redis").createClient()
const auth = require("../middleware/authorization.js")


router.post("/",async(req,res,next)=>{
    const {latitude,longitude} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        client = new Client(db.pgConnect)
        client.connect()
        const sql = `SELECT 
                        count(*) 
                    FROM 
                        nodam 
                    WHERE 
                        (latitude - $1)^2 + 
                        (longitude - $2)^2 < distance^2;`
        const values = [latitude,longitude]
        const data = await client.query(sql,values)
        console.log("Nodam Request success")
        if(data.rows[0].count < 1){
            const err = new Error
            err.message = "No data"
            err.status = 403
            throw err
        }
        result.success = true;
        res.send(result)
    }catch(err){
        console.log("POST /Nodam", err.message)
        next(err)
    } finally{
        if(client) client.end()
    }
})


module.exports = router