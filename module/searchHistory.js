const inputCheck = require("../module/inputCheck.js");
const redis =require("redis").createClient()


const addSearchHistory = async(userId) => { //카운트 추가
    try{
        await redis.connect()
        const dataIndex = await redis.zRank(process.env.searchHistory,userId)
        const currentTime = new Date()
        const intTime = Math.floor(currentTime)

        if(dataIndex == null){ // 값이 기존에 존재하지 않음
            const size = await redis.ZCARD(process.env.searchHistory)
            if (size >= parseInt(process.env.recentSearch)){
                await redis.ZREMRANGEBYRANK(process.env.searchHistory,0,0)// 개수가 최대치 넘어가면 가장 오래된 값 삭제
            }
            await redis.zAdd(process.env.searchHistory, {"score" : intTime ,"value" : userId}); //추가
        } 
        else{// 값이 존재하면
            await redis.zAdd(process.env.searchHistory, {"score" : intTime ,"value" : userId}); // 첫반째로 초기화
        }

    } catch(err){
        console.log(err.message)
    } 
    redis.disconnect()
}


module.exports = {addSearchHistory}