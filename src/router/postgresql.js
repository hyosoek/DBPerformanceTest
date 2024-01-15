require('dotenv').config({ path: "../../.env" });
const router = require("express").Router()

const {Client} = require("pg")
const db = require('../../config/database.js');

// 로그인

const btreeAPI = "/postgresql/b-tree"
router.get(btreeAPI,async(req,res,next)=>{3
    //const { mail } = req.query;
    let client = null;
    try{
        client = new Client(db.pgConnect)
        client.connect()
        const sql = `SELECT 
                        count(*) 
                    FROM account 
                        WHERE id=$1;`
        const values = [mail]
        const data = await client.query(sql,values)
        const row = data.rows

        if(row[0].count == 0){
            result.success = true
            mailCertification.sending(mail)
            result.message = "Send Certification Number"
        }else{
            result.message = "Already exist mail"
        }
        res.send()
    }catch(err){
        console.log("GET "+ btreeAPI, err.message)
        next(err)
    } finally{
        if(client) client.end()
    }    
})


module.exports = router