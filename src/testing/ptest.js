require('dotenv').config({ path: "../../.env" });
const router = require("express").Router()

const client = require("../../config/database.js");
                        

class postgreTestClass {
    constructor () {
        // https://kicksky.tistory.com/29
        this.mainFunction()  
    }

    mainFunction = async(sql,count) => {
        // console.log("Pk - B-tree")
        // const sql0 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     *
        //                 FROM 
        //                     account 
        //                 WHERE 
        //                     id=5000000;`
        // await this.showAverageSelectLatency(sql0,20)

        // console.log("Hash idx")
        // const sql1 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     *
        //                 FROM 
        //                     account 
        //                 WHERE 
        //                     mail = 'tennfin1@gmail.com1';`
        // await this.showAverageSelectLatency(sql1,20)
    
        // console.log("B-tree idx on Duplication")
        // const sql2 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     *
        //                 FROM 
        //                     account
        //                 WHERE
        //                     longitude=-48.35523039348061;`
        // await this.showAverageSelectLatency(sql2,20)

        // console.log("Hash idx on Duplication")
        // const sql2 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     *
        //                 FROM 
        //                     account
        //                 WHERE
        //                     longitude=-48.35523039348061;`
        // await this.showAverageSelectLatency(sql2,20)

        // console.log("B-tree idx on Duplication , Range Search")
        // const sql3 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     count(*)
        //                 FROM 
        //                     account
        //                 WHERE
        //                     longitude > 150;`
        // await this.showAverageSelectLatency(sql3,20)

        // console.log("")
        // const sql3 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     count(*)
        //                 FROM 
        //                     account
        //                 WHERE
        //                     longitude > 150;`
        // await this.showAverageSelectLatency(sql3,20)

        // console.log("H")
        // const sql4 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     longitude, 
        //                     COUNT(*) 
        //                 FROM 
        //                     account 
        //                 GROUP BY 
        //                     longitude 
        //                 HAVING 
        //                     COUNT(*) > 1;`
        // await this.showAverageSelectLatency(sql4,20)

        // console.log("Nearst distance Search")
        // const sql5 = `EXPLAIN ANALYZE 
        //                 SELECT 
        //                     *,
        //                     ((latitude - 11.994151854243498 )^2 +        
        //                     (longitude + 48.35523039348061)^2) AS distance_squared
        //                 FROM 
        //                     account
        //                 ORDER BY 
        //                     distance_squared
        //                 LIMIT 
        //                     10;`
        // await this.showAverageSelectLatency(sql5,20)

        console.log("Nearst distance Search with PostGIS")
        const sql6 = `EXPLAIN ANALYZE 
                        SELECT * 
                        FROM account 
                        ORDER BY location::geometry <-> 'SRID=4326;POINT(-48.35523039348061 11.994151854243498)'::geometry 
                        LIMIT 10;`
        await this.showAverageSelectLatency(sql6,20)

    }

    showAverageSelectLatency = async(sql,count) => {
        let sum = 0
        const latencyVector = []
        for (let i = 0 ; i < count ; i++){
            const latencyTemp = await this.showSelectLatency(sql)
            latencyVector.push(latencyTemp)
        }
        latencyVector.sort()

        for(let i = 1; i < latencyVector.length -1 ; i++){
            sum += latencyVector[i]
        }
        console.log("Average Latency(without min & max) : " + sum/(count-2) + " ms");
    }

    showSelectLatency = async(sql) =>{
        let returnValue
        const data = await client.query(sql)
        const row = data.rows
        const valueTemp = (row[row.length-1])

        returnValue = parseFloat(valueTemp['QUERY PLAN'].match(/(\d+\.\d+)/)[0]);
        
        console.log(returnValue)
        return returnValue
    }
}



module.exports = postgreTestClass;