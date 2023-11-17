const inputCheck = require("../module/inputCheck.js")

const router = require("express").Router()
const {Client} = require("pg")
const db = require('../../config/database.js');
const redis =require("redis").createClient()
const auth = require("../middleware/authorization.js")


router.put("/address",auth.authCheck,async(req,res,next)=>{
    const {longitude,latitude} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(longitude).isMaxSize(20).isEmpty()
        inputCheck(latitude).isMaxSize(20).isEmpty()

        client = new Client(db.pgConnect)
        client.connect()
        const sql = `UPDATE account 
                    SET longitude=$1, latitude=$2 
                    WHERE id=$3;`
        const values = [longitude,latitude,req.decoded.id]
        const data = await client.query(sql,values)
        result.success = true;
        res.send(result)
    }catch(err){
        console.log("PUT /main/address", err.message)
        next(err)
    } finally{
        if(client) client.end()
    }
})

router.get("/totalInformation",auth.authCheck,async(req,res,next) =>{
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        client = new Client(db.pgConnect)
        client.connect()
        const sql = `SELECT 
                        json_object_agg(device, data) AS result
                    FROM (
                        SELECT 
                            'refrigerator' AS device, 
                            json_agg(refrigerator.*) AS data
                        FROM 
                            refrigerator
                        WHERE 
                            account_id = $1
            
                        UNION ALL
                    
                        SELECT 
                            'air_conditioner' AS device, 
                            json_agg(air_conditioner.*) AS data
                        FROM 
                            air_conditioner
                        WHERE 
                            account_id = $1

                        UNION ALL
                
                        SELECT 
                            'television' AS device, 
                            json_agg(television.*) AS data
                        FROM 
                            television
                        WHERE 
                            account_id = $1

                        UNION ALL
                
                        SELECT 
                            'washing_machine' AS device, 
                            json_agg(washing_machine.*) AS data
                        FROM 
                            washing_machine
                        WHERE 
                            account_id = $1
                        
                        UNION ALL
                
                        SELECT 
                            'microwave' AS device, 
                            json_agg(microwave.*) AS data
                        FROM 
                            microwave
                        WHERE 
                            account_id = $1

                        UNION ALL
                
                        SELECT 
                            'boiler' AS device, 
                            json_agg(boiler.*) AS data
                        FROM 
                            boiler
                        WHERE 
                            account_id = $1

                        UNION ALL
                
                        SELECT 
                            'dryer' AS device, 
                            json_agg(dryer.*) AS data
                        FROM 
                            dryer
                        WHERE 
                            account_id = $1

                    ) AS devices_data;`
        const values = [1110032]
        const data = await client.query(sql,values)
        const row = data.rows

        console.log(row[0].result)

        result.success = true
        result.message = "Send Certification Number"
        res.send(result)
    }catch(err){
        console.log("GET /account/sign-up/send-mail", err.message)
        next(err)
    } finally{
        if(client) client.end()
    }    
})


module.exports = router