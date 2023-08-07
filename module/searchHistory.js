const inputCheck = require("../module/inputCheck.js");
const redis =require("redis").createClient()


const addSearchHistory = async(userId) => { //카운트 추가
    try{
        await redis.connect()
        const dataIndex = await redis.zRank('searchHistory',userId)

        if(dataIndex == null){ // 값이 존재하지 않으면
            const size = await redis.ZCARD('searchHistory')
            if (size >= parseInt(process.env.recentSearch)){
                await redis.ZREMRANGEBYRANK('searchHistory',size-1,size-1)// 값이 정해진 개수를 넘어가면
            }
            const redislist = await redis.zRange('searchHistory', 0, -1)
            for (const member of redislist) {
                await redis.ZINCRBY('searchHistory', 1, member)
            }
            await redis.zAdd('searchHistory', {"score" : 1 ,"value" : userId}); //추가
        } 
        else{// 값이 존재하면
            const redislist = await redis.zRange('searchHistory', 0, dataIndex-1)
            for (const member of redislist) {
                await redis.ZINCRBY('searchHistory', 1, member)
            }
            await redis.zAdd('searchHistory', {"score" : 1 ,"value" : userId}); // 첫반째로 초기화
        }

    } catch(err){
        console.log(err.message)
    } 
    redis.disconnect()
}


module.exports = {addSearchHistory}