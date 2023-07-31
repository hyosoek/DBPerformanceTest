const router = require("express").Router()
const client = require("mongodb").MongoClient

const inputCheck = require("../module/inputCheck.js");

router.get("/",async(req,res) =>{
    const {newest,id,pagenum} = req.query;
    const result = {
        "success" :false,
        "message" :null,
        "data" :null,
        "maxpage": null,
    }
    
    let conn = null //중요!
    try{
        const newestCheck = new inputCheck(newest)
        const idCheck = new inputCheck(id)
        const pagenumCheck = new inputCheck(pagenum)

        // if (newestCheck.isEmpty().result != true) result.message = newestCheck.errMessage
        if (idCheck.isNull().isUndefined().result != true) result.message = idCheck.errMessage // isIP 넣어야할 듯
        else if (pagenumCheck.isEmpty().result != true) result.message = pagenumCheck.errMessage
        else{
            conn  = await client.connect(process.env.mongoDb)//계정이 없어서 오로지 하나의 변수
            let isNewest = null;

            isNewest = parseInt(newest) * (-1)

            let data = null
            let idUndefined = undefined
            if(id != "") idUndefined = {"id": id}
            
            
            // data = await conn.db("healthpartner")
            //     .collection("log")
            //     .find(idUndefined)
            //     .toArray()
            //     .skip((pagenum-1)*process.env.logPerPage)
            //     .limit(parseInt(process.env.logPerPage))
            //     .sort({ time: isNewest })
            //     .toArray()
            // count = await conn.db("healthpartner")
            //     .collection("log")
            //     .countDocuments(idUndefined);


            const matchCondition = id ? { id: id } : {};

            // aggregate 파이프라인 설정
            const pipeline = [
            { $match: matchCondition }, 
            { $sort: { time: isNewest } }, // 시간 기준으로 내림차순 정렬하여 최근 10개를 가져오기 위해 필요
            { $limit: parseInt(process.env.logPerPage) }, // 최근 10개 데이터만 가져오기
            { $skip: (pagenum-1)*process.env.logPerPage },
            { $group: { _id: null, totalCount: { $sum: 1 }, data: { $push: '$$ROOT' } } },
            { $project: { _id: 0, totalCount: 1, data: 1 } },
            ];

            // aggregate 실행
            const result = await conn.db('healthpartner').collection("log")
                .aggregate(pipeline)
                .toArray();

            const recentLogs = result.length > 0 ? result[0].data : [];
            const totalCount = result.length > 0 ? result[0].totalCount : 0;

            console.log('Recent Logs:', recentLogs);
            console.log('Total Count:', totalCount);


            result.maxpage = Math.ceil(data.length / process.env.logPerPage);
            result.data = data
            result.success = true
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