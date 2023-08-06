const router = require("express").Router()
const client = require("mongodb").MongoClient

const inputCheck = require("../module/inputCheck.js");
const verify = require("../module/verify.js")


router.get("/",async(req,res,next) =>{
    const {newest,id,pagenum} = req.query;
    const result = {
        "success" :false,
        "message" :null,
        "data" :null,
        "maxpage": null,
        "auth": false
    }
    
    let conn = null //중요!
    try{
        if(req.decoded.isAdmin == false || !req.decoded){ // 관리자계정이거나, 아예 존재하지 않을때?
            result.message = "Token error"
            return
        }
        result.auth = true
        
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

            req.resData = result
            await verify.publishToken(req,res)
            result.token = await req.resData.token
        }
    }catch(err){
        console.log(`GET /log Error : ${err.message}`) //이거 일일히 하기 힘든데, req 헤더 이용
        result.message = err.message
    }finally{
        if(conn) conn.close()
        res.send(result)
    }
})


module.exports = router