const inputCheck = require("../module/inputCheck.js");
const redis =require("redis").createClient()


const countLogin = async(userNum) => { //카운트 추가
    try{
        await redis.connect()
        await redis.sAdd(process.env.userCount,userNum.toString())
    } catch(err){
        console.log(err.message)
    } 
    redis.disconnect()
}


const showMemoryCount = async() => { //현재 redis 메모리에 존재하는 count수 반환
    let data = null
    try{
        await redis.connect()
        data = await redis.sCard(process.env.userCount)
    } catch(err){
        console.log(err.message)
    } 
    redis.disconnect()
    return data
}


module.exports = {countLogin,showMemoryCount}