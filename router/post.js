const router = require("express").Router()
const dateParse = require('../module/dateParse');
const inputCheck = require("../module/inputCheck.js");

const {Client} = require("pg")
const db = require('../database.js');
const auth = require('../middleware/authorization');

const imageProcess = require('../middleware/imageUpload');


// load postlist
router.get("/list",auth.userCheck,async(req,res,next)=>{
    const {pagenum} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "postList" : []
    }
    let client = null
    try{
        const numCheck = new inputCheck(pagenum)
        if (numCheck.isEmpty().result != true) result.message = numCheck.errMessage
        else{
            const postcount = process.env.postPerPage // 환경변수
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `SELECT name,postnum,title,date FROM post 
            JOIN account ON post.usernum = account.usernum
            ORDER BY postnum DESC LIMIT $1 
            OFFSET $2;`
            const values = [postcount,(pagenum-1)*postcount]
            const data = await client.query(sql,values)

            const row = data.rows
            if(row.length != 0){
                result.success = true
                result.message = (pagenum) + "페이지 게시글 가져오기 성공"
                row.forEach((elem)=>elem.date = dateParse.showTimeLapse(elem.date))
                result.postList = row
            }
            else{
                result.message == "게시글 존재하지 않습니다."
            }
        }
        res.send(result)
    }catch(err){
        console.log("GET /post/list",err.message)
        next(err)
    }finally{
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
})

// countPage
router.get("/count",auth.userCheck,async(req,res,next)=>{
    const result = {
        "success" : false,
        "message" : "",
        "pagecount":null
    }
    let client = null
    try{
        client = new Client(db.pgConnect)
        client.connect()
        const sql = "SELECT COUNT(*) AS count FROM post;"
        const data = await client.query(sql)

        const row = data.rows
        if(row.length != 0){
            result.success = true
            result.pagecount = parseInt(((row[0].count)-1)/process.env.postPerPage) +1
            result.message = "총 게시글 페이지 수입니다."
        }else{
            result.message = "게시글이 존재하지 않습니다."
        }
        res.send(result)
    }catch(err){
        console.log("GET /post/count",err.message)
        next(err)
    }finally{
        if(client) client.end()
        req.resData = result
        next()
    }
})

// getpost
router.get("/",auth.userCheck,async(req,res,next)=>{
    const {postnum} = req.query; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "title" : "",
        "detail": "",
        "date" : "",
        "name" : "",
        "imageUrlList":[]
    }
    let client = null
    try{
        const numCheck = new inputCheck(postnum)
        if (numCheck.isEmpty().result != true) result.message = numCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `SELECT name,postnum,title,date,detail,account.usernum,imageurl 
            FROM post 
            JOIN account ON post.usernum = account.usernum 
            WHERE postnum = $1;`
            const value = [postnum]
            const data = await client.query(sql,value)

            const row = data.rows
            if(row.length != 0){
                result.success = true
                result.message = "게시글 가져오기 성공"
                result.title = row[0].title
                result.detail = row[0].detail
                result.date = row[0].date
                result.name = row[0].name
                if(row[0].imageurl){
                    for(let i = 0 ; i < row[0].imageurl.length; i++){
                        result.imageUrlList.push(process.env.AwsBucketAddress + row[0].imageurl[i])    
                    }
                }
                }else{
                result.message = "존재하지 않는 글입니다."
            }
        }
        res.send(result)
    }catch(err){
        console.log("GET /post",err.message)
        next(err)
    }finally{
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
    
})

// postWrite
router.post("/",auth.userCheck,imageProcess.upload.array('images',5),async(req,res,next)=>{
    const {title,detail} = req.body;
    //auto date
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    try{
        const titleCheck = new inputCheck(title)
        const detailCheck = new inputCheck(detail)

        if (titleCheck.isMinSize(4).isMaxSize(63).isEmpty().result != true) result.message = titleCheck.errMessage
        else if (detailCheck.isMinSize(4).isMaxSize(2047).isEmpty().result != true) result.message = detailCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const usernum = await req.decoded.userNum
            const sql = `INSERT INTO post(title,detail,usernum,imageurl) VALUES($1,$2,$3,$4);`
            const imageUrlList = []
            for(let i = 0;i<req.files.length;i++){
                const modifiedUrl = req.files[i].location.substring((process.env.AwsBucketAddress).length);
                imageUrlList.push(modifiedUrl)
            }
            
            const value = [title, detail, usernum, imageUrlList];
            const data = await client.query(sql,value)
    
            result.success = true
            result.message = "게시글 작성 성공" 
        }            
        res.send(result)
    }catch(err){
        console.log("POST /post",err.message)
        next(err)
    } finally{
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
    
})

// postFix
router.put("/",auth.userCheck,imageProcess.uploadTemp.array('images',5),async(req,res,next)=>{
    const {title,detail,postnum} = req.body; // 역시나 예외처리할 때 유저 고유 식별번호를 확인합니다.
    const result = {
        "success" : false,
        "message" : ""
    }
    let client = null
    const newImageList = []
    const deleteUrlList = []
    try{
        const titleCheck = new inputCheck(title)
        const detailCheck = new inputCheck(detail)
        const numCheck2 = new inputCheck(postnum)

        if (titleCheck.isMinSize(4).isMaxSize(63).isEmpty().result != true) result.message = titleCheck.errMessage
        else if (detailCheck.isMinSize(4).isMaxSize(2047).isEmpty().result != true) result.message = detailCheck.errMessage
        else if (numCheck2.isEmpty().result != true) result.message = numCheck2.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            
            await client.query('BEGIN');
            const selectSql = 'SELECT imageurl FROM post WHERE postnum = $1'
            const selectValue = [postnum]
            const initData = await client.query(selectSql,selectValue);
            const row = initData.rows[0].imageurl
            if(req.body.deleteList){
                for(let i = 0; i < req.body.deleteList.length; i++){ //삭제해야 할 이미지의 인덱스 순서를 어떻게 보내줄 지 모르기 때문
                    deleteUrlList.push(row[parseInt(req.body.deleteList[i])])
                    row[parseInt(req.body.deleteList[i])] = null
                }
            }
            for(let i = 0; i < row.length;i++){
                if(row[i]!=null) newImageList.push(row[i]) // 삭제되지 않은 값은 넣어주기
            }
            for(let i = 0; i < req.files.length; i++){ //새로들어온 이미지를 temp에 넣어둔 것
                newImageList.push(req.files[i].location.substring((process.env.AwsBucketAddressTemp).length))
            }

            if(newImageList > 5) {
                const error = new Error("too many image error!")
                error.status = 500
                throw error
            }

            const usernum = await req.decoded.userNum
            const sql = `UPDATE post SET title = $1, detail = $2, imageurl = $3 WHERE postnum = $4 AND usernum = $5;`
            const value = [title, detail,newImageList, postnum, usernum];
            const data = await client.query(sql,value)

            if(data.rowCount == 0 ){
                const error = new Error("No Auth to Update Data!")
                error.status = 403
                throw error
            }
            result.success = true
            result.message = "게시글 수정 성공"
            await client.query('COMMIT');

            for(let i = 0 ;i < req.files.length;i++){ // temp에 있는 걸 옮겨주기
                imageProcess.passImage(req.files[i].location.substring((process.env.AwsBucketAddressTemp).length))
            }
            
            for(let i = 0 ;i < deleteUrlList.length; i++){ // 기존에 있던 것 중 삭제할 것 삭제
                console.log(deleteUrlList[i])
                imageProcess.deleteImage(deleteUrlList[i],process.env.AwsBucketName)
            }
        }        
        res.send(result)

    }catch(err){
        await client.query('ROLLBACK');
        console.log("PUT /post",err.message)
        next(err)
    }finally{
        imageProcess.clearImages(newImageList,process.env.AwsBucketNameTemp)
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
})

// postDelete
router.delete("/",auth.userCheck,async(req,res,next)=>{
    const {postnum} = req.body; //애초에 프론트엔드에서 예외처리를 해줘도 백엔드에서 한번더 점검해야 합니다.(세션을 통해서)    
    const result = {
        "success" : false,
        "message" : ""
    }
    var client = null
    try{
        const numCheck = new inputCheck(postnum)
        if (numCheck.isEmpty().result != true) result.message = numCheck.errMessage
        else{
            client = new Client(db.pgConnect)
            client.connect()
            const sql = `DELETE FROM post WHERE postnum = $1 AND usernum = $2 RETURNING imageurl;`
            const usernum = await req.decoded.userNum
            const value = [postnum,usernum]
            console.log(postnum,usernum)
            const data = await client.query(sql,value)

            if(data.rowCount == 0 ){
                const error = new Error("No Auth to Delete Data!")
                error.status = 403
                throw error
            }
            //성공적으로 지워졌다면 s3도 비워주기   

            imageProcess.clearImages(data.rows[0].imageurl,process.env.AwsBucketName)

            result.success = true
            result.message = "게시글 삭제 성공"  
            res.send(result)
        }                  
    }catch(err){
        console.log("/post",err.message)
        next(err)
    }finally{
        if(client) client.end()
        req.resData = result //for logging
        next()
    }
})



module.exports = router