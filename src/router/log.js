const router = require("express").Router()
const client = require("mongodb").MongoClient

const inputCheck = require("../module/inputCheck.js");
const searchHistory = require("../module/searchHistory.js")
const redis =require("redis").createClient()
const auth = require("../middleware/authorization.js")


router.get("/",auth.adminCheck,async(req,res,next) =>{
    const {newest,id,pagenum} = req.query;
    const result = {
        "success" :false,
        "message" :null,
        "data" :null,
        "maxpage": null
    }
    
    let conn = null //중요!
    try{
        const newestCheck = new inputCheck(newest)
        const idCheck = new inputCheck(id)
        const pagenumCheck = new inputCheck(pagenum)

        if (idCheck.isNull().isUndefined().result != true) result.message = idCheck.errMessage // isIP 넣어야할 듯
        else if (pagenumCheck.isEmpty().result != true) result.message = pagenumCheck.errMessage
        else{
            conn  = await client.connect(process.env.mongoDb)//계정이 없어서 오로지 하나의 변수
            let isNewest = null;
            isNewest = parseInt(newest) * (-1)
            const matchCondition = id ? { id: id } : {};

            const pipeline = [
                { $match: matchCondition },
                { $facet: {
                    data: [
                      { $sort: { time: isNewest} },
                      { $skip: (pagenum-1)*process.env.logPerPage },
                      { $limit: parseInt(process.env.logPerPage) },
                    ],
                    totalCount: [
                      { $count: 'totalCount' },
                    ],
                  }
                },
                { $unwind: '$totalCount' },
                { $project: { _id: 0, totalCount: '$totalCount.totalCount', data: 1 } },
            ];

            const dbResult = await conn.db('healthpartner').collection("log")
                .aggregate(pipeline)
                .toArray(); //

            const data = dbResult.length > 0 ? dbResult[0].data : [];
            const count = dbResult.length > 0 ? dbResult[0].totalCount : 0;

            result.maxpage = Math.ceil(count / process.env.logPerPage);
            result.data = data
            result.success = true

            if(id){
                await searchHistory.addSearchHistory(id)
            }
            req.resData = result
        }
        res.send(result)
    }catch(err){
        console.log(`GET /log Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        next(err)
    }finally{
        if(conn) conn.close()
    }
})

router.get("/search-history",auth.adminCheck,async(req,res,next) =>{
    const result = {
        "success" :false,
        "message" :null,
        "data" :null
    }
    
    let conn = null //중요!
    try{
        await redis.connect()
        const redislist = await redis.zRange(process.env.searchHistory, 0, -1)
       
        result.success = true
        result.message = "최근검색목록"
        result.data = redislist

        res.send(result)
    }catch(err){
        console.log(`GET /log/search-history Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        next(err)
    }finally{
        redis.disconnect()
    }
})

router.delete("/search-history",auth.adminCheck,async(req,res,next) =>{
    const result = {
        "success" :false,
        "message" :null
    }
    
    let conn = null //중요!
    try{
        await redis.connect()
        await redis.ZREMRANGEBYRANK(process.env.searchHistory, 0, -1)
       
        result.success = true
        result.message = "삭제 완료"

        res.send(result)
    }catch(err){
        console.log(`DELETE /log/search-history Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        next(err)
    }finally{
        redis.disconnect()
    }
})



module.exports = router