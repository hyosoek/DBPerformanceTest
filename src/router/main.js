const router = require("express").Router()
const client = require("mongodb").MongoClient

const inputCheck = require("../module/inputCheck.js")
const redis =require("redis").createClient()
const auth = require("../middleware/authorization.js")


router.put("/",auth.adminCheck,async(req,res,next)=>{
    const {mail,pw1,pw2,code} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null;
    try{
        inputCheck(mail).isMinSize(4).isMaxSize(99).isMail().isEmpty()
        inputCheck(pw1).isMinSize(4).isMaxSize(31).isEmpty().isEqual(pw2)
        inputCheck(code).isMinSize(5).isMaxSize(7).isEmpty()

        await redis.connect();
        const redisData = await redis.get(mail+process.env.mailCert)

        if(redisData == code){
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `UPDATE account 
                        SET pw=$1 
                        WHERE mail=$2;` // 트랜잭션 체크를 할까...?
            const values = [pw1,mail]
            const data = await client.query(sql,values)
            await redis.expire(mail+process.env.mailCert, "0")

            result.success = true;
            res.send(result)
        }else{
            const error = new Error();
            error.status = 403;
            error.message="Athentication Fail!";
            throw error;
        }
    }catch(err){
        console.log("PUT /account/pw", err.message)
        next(err)
    } finally{
        redis.disconnect()
        if(client) client.end()
    }
})

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



module.exports = router