require('dotenv').config({ path: "../../.env" });
const router = require("express").Router()

const client = require("../../config/database.js");
                        

class postgreTestClass {
    constructor () {
        console.log("Under this line is Ptest Latency")
        // https://kicksky.tistory.com/29

        const sql1 = `EXPLAIN ANALYZE 
                        SELECT 
                            *
                        FROM 
                            account 
                        WHERE 
                            mail = 'tennfin1@gmail.com1';`
        this.showAverageSelectLatency(sql1,10)

        // const sql2 = `EXPLAIN ANALYZE SELECT 
        //                     count(*) 
        //                 FROM account`
        // this.showAverageSelectLatency(sql)  
    }

    showAverageSelectLatency = async(sql,count) => {
        const repeatCount = count;
        let sum = 0;
        const latencyVector = [];
        for (let i = 0 ; i < repeatCount ; i++){
            latencyVector.push(await this.showSelectLatency(sql))
        }
        latencyVector.sort()

        for(let i = 1; i < latencyVector.length -1 ; i++){
            sum += latencyVector[i]
        }
        
        console.log("Average Latency(without min & max) : " + sum/(repeatCount-2) + " ms");
    }

    showSelectLatency = async(sql) =>{
        let returnValue;
        const data = await client.query(sql)
        const row = data.rows
        const valueTemp = (row[row.length-1])

        returnValue = parseFloat(valueTemp['QUERY PLAN'].match(/(\d+\.\d+)/)[0]);
        
        
        return console.log(returnValue)
    }
}



module.exports = postgreTestClass;