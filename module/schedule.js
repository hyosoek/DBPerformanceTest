const schedule = require('node-schedule');
const redis = require("redis").createClient();
const {Client} = require("pg")
const db = require('../database.js');

const hourSchedule = schedule.scheduleJob('*/10 * * * * *',async function(){
    let dbClient = null;
    try {
        dbClient = new Client(db.pgConnect)
        dbClient.connect()
        
        await redis.connect()
        const data = await redis.sCard(process.env.userCount);
        
        const currentTime = new Date();
        const currentDate = currentTime.toISOString().slice(0, 10);
        const currentHMS = currentTime.toLocaleTimeString();
        const query = `INSERT INTO logincount (date_col, time_col, count) VALUES ($1, $2, $3)`;
        const values = [currentDate, currentHMS, data];
        await dbClient.query(query, values);
        
        console.log(await redis.SMEMBERS(process.env.userCount))
        console.log(await redis.ZRANGE(process.env.searchHistory,0,-1))
        console.log(await redis.ZRANGE(process.env.blackList,0,-1))


        // 오래된 블랙리스트 청소하기
        const expiredBlacklist = await redis.ZRANGEBYSCORE (process.env.blackList, 0, (Math.floor(currentTime-(parseInt(process.env.tokenTime) * 60 * 60 * 1000))))
        for(const member of expiredBlacklist){
            await redis.ZREM(process.env.blackList,member)
        }
        console.log()

    } catch (error) {
        console.error(error);
        console.log(error)
    } finally {
        if(dbClient) dbClient.end()
        await redis.disconnect()
    }
});

module.exports = {hourSchedule}