const router = require("express").Router()
const {Client} = require("pg")
const db = require('../../config/database.js');

const inputCheck = require("../module/inputCheck.js");
const redis =require("redis").createClient()
const auth = require("../middleware/authorization.js")


router.get("/refrigerator",auth.authCheck,async(req,res,next) =>{
    const {id} = req.query;
    const result = {
        "success" : false,
        "data" : null,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(id).isEmpty().isFinite()
        const id = `SELECT *
                        FROM (
                            SELECT 
                                a.id AS user_id, a.latitude, a.longtitude, b.id AS air_conditioner_id,b.energy, b.co2,
                                ROW_NUMBER()
                                OVER (ORDER BY 
                                    ABS(a.latitude - (SELECT 
                                                            latitude 
                                                    FROM 
                                                        account 
                                                    WHERE 
                                                        id = $1))^2 +        
                                    ABS(a.longtitude - (SELECT
                                                            longtitude 
                                                     FROM 
                                                        account 
                                                    WHERE 
                                                        id = $1))^2) 
                                AS row_number           
                            FROM 
                                account a                                                              
                            JOIN                                                                   
                                air_conditioner b 
                            ON 
                                a.id = b.account_id
                        ) AS subquery
                    WHERE 
                        row_number BETWEEN 0 AND 101
                    ORDER BY 
                        row_number;`

        const values = [req.decoded.id,energy,co2,modelname]
        const data = await client.query(sql,values)
        const rows = data.row
        
        result.data = rows;
        result.success = true;
        res.send(result)
    }catch(err){
        console.log("GET /appliance/refrigerator", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
    }  
})

router.post("/refrigerator",auth.authCheck,async(req,res,next) =>{
    const {energy,co2,modelname} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(energy).isEmpty().isFinite()
        inputCheck(co2).isEmpty().isFinite()
        inputCheck(modelname).isMinSize(4).isMaxSize(50).isEmpty()

        client = new Client(db.pgConnect)
        client.connect()
        const sql = `INSERT INTO 
                        refrigerator (account_id,energy,co2,model_name) 
                    VALUES 
                        ($1,$2,$3,$4);` //여기서 duplicate 체크
        const values = [req.decoded.id,energy,co2,modelname]
        const data = await client.query(sql,values)

        if(data.rowCount){ // 삭제된게 있는 경우
            result.success = true;
        }else{
            result.message = "Update Fail!"
        }

        result.success = true;
        res.send(result)
    }catch(err){
        console.log("POST /appliance/refrigerator", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
    }  
})

router.delete("/refrigerator",auth.authCheck,async(req,res,next) =>{
    const {id} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(id).isEmpty().isInt()

        client = new Client(db.pgConnect)
        client.connect()
        const sql = `DELETE FROM 
                        refrigerator 
                    WHERE 
                        id=$1 AND account_id=$2` //여기서 duplicate 체크
        const values = [id,req.decoded.id]
        const data = await client.query(sql,values)

        if(data.rowCount){ // 삭제된게 있는 경우
            result.success = true;
        }else{
            result.message = "Not exist data!"
        }
        res.send(result)
    }catch(err){
        console.log("DELETE /appliance/refrigerator", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
    }  
})





module.exports = router