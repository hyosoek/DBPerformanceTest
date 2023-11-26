const router = require("express").Router()
const {Client} = require("pg")
const db = require('../../../config/database.js');

const inputCheck = require("../../module/inputCheck.js");
const auth = require("../../middleware/authorization.js");
const adaptiveCacheTable = require("../../module/adaptiveCacheTable.js");
const relativeTier = require("../../module/relativeTier.js");


router.get("/",auth.authCheck,async(req,res,next) =>{
    const {id} = req.query;
    const result = {
        "success" : false,
        "data" : null,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(id).isEmpty()
        client = new Client(db.pgConnect)
        client.connect()
        const sql1 = `SELECT 
                        a.longitude,a.latitude,b.energy,b.co2,b.model_name
                    FROM
                        account a 
                    JOIN 
                        washing_machine b 
                    ON 
                        a.id = b.account_id 
                    WHERE 
                        a.id = $1 AND b.id = $2`
        const values1 = [req.decoded.id,id]
        const data1 = await client.query(sql1,values1)
        let row1 = data1.rows
        if(row1.length != 1){
            err = new Error()
            err.status = 403
            err.message = "Invalid data on account or washing_machine key!"
            throw err
        }
        await adaptiveCacheTable.setTable(row1[0].longitude,row1[0].latitude)
        let initAreaLevel = await adaptiveCacheTable.getInitArea(row1[0].longitude,row1[0].latitude) // 캐싱테이블을 통해 얼마나 상세한 부분에서 시작할지 정        
        let nearUserData = null
        if(initAreaLevel > 5) initAreaLevel = 10 // 레벨의 최대값을 제한

        const divideFactor = Math.pow(2, initAreaLevel+3) //값이 커질 수록 검색 범위가 줄어듦 = initAreaLevel값이 크게 세팅되면 검색 범위가 줄어듦
        const longRange = parseFloat(process.env.koreanMaxLongitude)-parseFloat(process.env.koreanMinLongitude)
        const latRange = parseFloat(process.env.koreanMaxLatitude)-parseFloat(process.env.koreanMinLatitude)

        let initLongMaxRange = row1[0].longitude + (longRange/divideFactor)/2
        let initLongMinRange = row1[0].longitude - (longRange/divideFactor)/2
        let initLatMaxRange = row1[0].latitude + (latRange/divideFactor)/2
        let initLatMinRange = row1[0].latitude - (latRange/divideFactor)/2

        let longMaxRange = initLongMaxRange
        let longMinRange = initLongMinRange
        let latMaxRange = initLatMaxRange
        let latMinRange = initLatMinRange

        const maxDivideRangeCount = 6
        for(let i = maxDivideRangeCount;i >= 0; i--){ //주어진 범위에서 전체 범위까지 몇번 쪼갤것?
            let newDivideFactor = Math.pow(2,i)
            const sql2 = `SELECT energy as data
                        FROM (
                            SELECT 
                                b.energy,
                                ROW_NUMBER()
                                OVER (ORDER BY 
                                    ABS(a.latitude - (SELECT 
                                                            latitude 
                                                    FROM 
                                                        account 
                                                    WHERE 
                                                        id = $1))^2 +        
                                    ABS(a.longitude - (SELECT
                                                            longitude 
                                                    FROM 
                                                        account 
                                                    WHERE 
                                                        id = $1))^2) 
                                AS row_number
                            FROM 
                                account a                                                              
                            JOIN                                                                   
                                washing_machine b 
                            ON 
                                a.id = b.account_id   
                            WHERE
                                    a.longitude < $2 
                                AND
                                    a.longitude > $3
                                AND
                                    a.latitude < $4
                                AND
                                    a.latitude > $5     
                        ) AS subquery
                    WHERE
                        row_number BETWEEN 1 AND 101
                    ORDER BY 
                        energy;` //비교 기준은 에너지입니다.

            const values2 = [req.decoded.id,longMaxRange,longMinRange,latMaxRange,latMinRange]
            const data2 = await client.query(sql2,values2)
            const row2 = data2.rows
            nearUserData = row2.map((elem) => { return elem })
            if (row2.length >= 100){
                break;
            }
            longMaxRange = initLongMaxRange + (parseFloat(process.env.koreanMaxLongitude)-initLongMaxRange)/newDivideFactor
            longMinRange = initLongMinRange - (initLongMinRange-parseFloat(process.env.koreanMinLongitude))/newDivideFactor
            latMaxRange = initLatMaxRange + (parseFloat(process.env.koreanMaxLatitude)-initLatMaxRange)/newDivideFactor
            latMinRange = initLatMinRange - (initLatMinRange-parseFloat(process.env.koreanMinLatitude))/newDivideFactor
        }
        
        const relativeData = await relativeTier.getRelativeAscTier(nearUserData,row1[0].energy)

        delete row1[0]["latitude"]
        delete row1[0]["longitude"]
        result.data = row1[0]
        result.data.tier = relativeData.tier
        result.data.relativePercent = relativeData.percentage
        result.success = true;
        res.send(result)
    }catch(err){
        console.log("GET /appliance/washing_machine", err.message)
        next(err)
    } finally{
        if(client) client.end()
    }  
})

router.post("/",auth.authCheck,async(req,res,next) =>{
    const {energy,co2,modelname} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(energy).isEmpty().isFinite()
        inputCheck(co2).isEmpty().isFinite()
        inputCheck(modelname).isEmpty().isMinSize(4).isMaxSize(50)

        client = new Client(db.pgConnect)
        client.connect()
        const sql = `INSERT INTO 
                        washing_machine (account_id,energy,co2,model_name) 
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
        console.log("POST /appliance/washing_machine", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
    }  
})

router.delete("/",auth.authCheck,async(req,res,next) =>{
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
                        washing_machine 
                    WHERE 
                        id=$1 AND account_id=$2` //여기서 duplicate 체크
        const values = [id,req.decoded.id]
        const data = await client.query(sql,values)

        if(data.rowCount){ // 삭제된게 있는 경우
            result.success = true;
        }else{
            result.message = "Not exist data or permission"
        }
        res.send(result)
    }catch(err){
        console.log("DELETE /appliance/washing_machine", err.message) // 이건 해주는게 맞음
        next(err)
    } finally{
        if(client) client.end()
    }  
})


module.exports = router
