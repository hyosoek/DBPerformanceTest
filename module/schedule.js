const schedule = require('node-schedule');
const redis = require("redis").createClient();
const {Client} = require("pg")
const db = require('../database.js');

const hourSchedule = schedule.scheduleJob('0 * * * *',async function(){
    let dbClient = null;
    try {
        dbClient = new Client(db.pgConnect)
        dbClient.connect()
        
        await redis.connect()
        const data = await redis.sCard("userCount");
        
        const currentTime = new Date();
        const currentDate = currentTime.toISOString().slice(0, 10);
        const currentHMS = currentTime.toLocaleTimeString();
        const query = `INSERT INTO logincount (date_col, time_col, count) VALUES ($1, $2, $3)`;
        const values = [currentDate, currentHMS, data];
        await dbClient.query(query, values);
        
        await redis.del("userCount");

    } catch (error) {
        console.error(error);
        console.log(error)
    } finally {
        if(dbClient) dbClient.end()
        await redis.disconnect()
    }
});

module.exports = {hourSchedule}