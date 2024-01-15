require('dotenv').config({ path: "../../.env" });
const router = require("express").Router()

const {Client} = require("pg")
const db = require('../../config/database.js');
const { TemporaryCredentials } = require('aws-sdk');


class postgreTestClass {
    constructor () {
        console.log("Under this line is Ptest Latency")
        // https://kicksky.tistory.com/29
        this.normalSelectAverage()        
    }

    normalSelectAverage = async() => {
        const repeatCount = 10;
        let sum = 0;
        const latencyVector = [];
        for (let i = 0 ; i < repeatCount ; i++){
            latencyVector.push(await this.normalSelectLatency())
        }

        console.log("Next")
        latencyVector.sort()

        for(let i = 1; i < latencyVector.length -1 ; i++){
            sum += latencyVector[i]
            console.log(latencyVector[i])
        }
        
        console.log("Average Latency : " + sum/(repeatCount-2));
    }

    normalSelectLatency = async() =>{
        let client = null;
        let returnValue; 
        try{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `EXPLAIN ANALYZE SELECT 
                            count(*) 
                        FROM account`
            const data = await client.query(sql)
            const row = data.rows
    
            if(row[0].count != 0){ //데이터가 존재하는 경우
                const valueTemp = (row[row.length-1])
                returnValue = parseFloat(valueTemp['QUERY PLAN'].match(/(\d+\.\d+)/)[0]);
                console.log(returnValue)
            }
        } finally{
            if(client) client.end()
            return returnValue
        }    
    }

}



module.exports = postgreTestClass;