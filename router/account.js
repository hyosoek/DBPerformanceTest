const router = require("express").Router()
const connection = require('../database.js');
const regex = require('./regex.js');

// 로그인
router.post("/log-in",(req,res)=>{
    const {id,pw} = req.body;
    const result = {
        "success" : false,
        "message" : "",
        "userNum" : null
    }
    if(!regex.idRegex.test(id)){
        result.message = "id 정규표현식 오류"
        res.send(result)
    }else if(!regex.pwRegex.test(pw)){
        result.message = "pw 정규표현식 오류"
        res.send(result)
    }else{
        connection.query(`SELECT * FROM user WHERE id = '${id}' AND pw = '${pw}'`,function(error,data) {
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                if(data.length >=1){
                    if(data.length == 1){
                        result.success = true
                        result.message = "로그인 성공"
                        result.userNum = data[0].usernum
                        res.send(result)
                    }
                    else{
                        result.message = "아이디 오류. 관리자께 문의하세요"
                        res.send(result)
                    }
                }
                else{
                    result.message = "존재하지 않는 아이디거나, 일치하지 않는 비밀번호입니다."
                    res.send(result)
                }
            }
        })
    }
    
})
// 회원가입 - 아이디 중복체크
router.get("/id-exist/:id",(req,res)=>{ //아이디 중복체크
    const {id} = req.params; 
    if(!regex.idRegex.test(id)){
        result.message = "id 정규표현식 오류"
        res.send(result)
    } else{
        connection.query(`SELECT * FROM user WHERE id = '${id}'`,function(error,data){
            const result = {
                "success" : false,
                "message" : ""
            }
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                if(data.length){
                    result.message = "아이디가 이미 존재합니다."
                    res.send(result)
                }
                else{
                    result.success = true
                    result.message = "사용 가능한 아이디입니다"
                    res.send(result)
                }
            }
        })
    }
})
// 회원가입
router.post("/",(req,res)=>{
    const {id,pw1,pw2,name,mail,birth,contact} = req.body;
    const result = {
        "success" : false,
        "message" : "",
    }
    if(!regex.idRegex.test(id)){
        result.message = "id 정규표현식 오류"
        res.send(result)
    } else if(!regex.pwRegex.test(pw1)){
        result.message = "pw 정규표현식 오류"
        res.send(result)
    } else if(!regex.nameRegex.test(name)){
        result.message = "이름 정규표현식 오류"
        res.send(result)
    } else if(!regex.mailRegex.test(mail)){
        result.message = "메일 정규표현식 오류"
        res.send(result)
    } else if(!regex.dateRegex.test(birth)){
        result.message = "생일 정규표현식 오류"
        res.send(result)
    } else if(!regex.contactRegex.test(contact)){
        result.message = "전화번호 정규표현식 오류"
        res.send(result)
    } else if(pw1 != pw2){
        result.message = "비밀번호 일치 오류"
        res.send(result)
    }
    else{
        connection.query(`SELECT * FROM user WHERE id = '${id}'OR mail = '${mail}' OR contact = '${contact}'`,function(error,data){ 
            //혹시 모르니 한 번 더 예외처리 해서 수행해줍니다.
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                if(data.length){ // 아이디, 메일, 전화번호 중 하나라도 중복되는 정보가 존재함
                    result.message = "이미 가입된 정보입니다."
                    res.send(result)
                }
                else{
                    connection.query(`INSERT INTO user(id,pw,name,mail,birth,contact) 
                    VALUES('${id}','${pw1}','${name}','${mail}','${birth}','${contact}');`
                    ,function(error,data){
                        if(error){
                            result.message = error
                            res.send(result)
                        }
                        else{
                            result.success = true
                            result.message = "회원가입 성공"
                            res.send(result)
                        }
                    })
                }
            }
        })
    }
       
})
// 아이디 찾기
router.get("/find-id/:name/:mail",(req,res)=>{
    const {name,mail} = req.params; // 받아옴
    console.log(mail)
    const result = {
        "success" : false,
        "message" : "",
        "id" : ""
    }
    if(!regex.nameRegex.test(name)){
        result.message = "이름 정규표현식 오류"
        res.send(result)
    } else if(!regex.mailRegex.test(mail)){
        result.message = "메일 정규표현식 오류"
        res.send(result)
    } else{
        connection.query(`SELECT * FROM user WHERE name = '${name}' AND mail = '${mail}';`,function(error,data){
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                if(data.length >=1){
                    if(data.length == 1){
                        result.success = true
                        result.message = "id 찾기 성공"
                        result.id = data[0].id
                        res.send(result)
                    }
                    else{
                        result.message = "계정 오류. 관리자께 문의하세요"
                        res.send(result)
                    }
                }
                else{
                    result.message = "존재하지 않는 정보입니다."
                    res.send(result)
                }
            }
        })
    } 
})
// 비번찾기 - 신원확인
router.get("/certification/:id/:name/:mail",(req,res)=>{
    const {id,name,mail} = req.params; // 받아옴
    const result = {
        "success" : false,
        "message" : "",
        "usernum" : null
    }
    if(!regex.idRegex.test(id)){
        result.message = "id 정규표현식 오류"
        res.send(result)
    } else if(!regex.nameRegex.test(name)){
        result.message = "이름 정규표현식 오류"
        res.send(result)
    } else if(!regex.mailRegex.test(mail)){
        result.message = "메일 정규표현식 오류"
        res.send(result)
    } else{
        connection.query(`SELECT * FROM user WHERE id = '${id}' 
        AND name = '${name}' AND mail = '${mail}';`,function(error,data1){
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                if(data1.length >=1){
                    result.message = "존재하는 정보입니다."
                    result.usernum = data1[0].usernum
                    result.success = true
                    res.send(result)
                }
                else{
                    result.message = "존재하지 않는 정보입니다."
                    res.send(result)
                }
            }
        })
    }
   
})
// 비번찾기 - 비번변경
router.put("/modify-Pw",(req,res)=>{
    const {usernum,newpw1,newpw2} = req.body; // 받아옴
    const result = {
        "success" : false,
        "message" : ""
    }
    if(!regex.pwRegex.test(newpw1)){
        result.message = "pw 정규표현식 오류"
        res.send(result)
    } else if(newpw1 == newpw2){
        connection.query(`UPDATE user SET pw = '${newpw1}' WHERE usernum = '${usernum}';`,function(error){
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                result.success = true
                result.message = "비밀번호 변경완료"
                res.send(result)
            }
        })
    }
    else{
        result.message = "비밀번호가 일치하지 않습니다."
        res.send(result)
    }
})
// 계정삭제
router.delete("/",(req,res)=>{
    const {usernum,pw} = req.body;
    const result = {
        "success" : false,
        "message" : ""
    }
    if(!regex.pwRegex.test(pw)){
        result.message = "pw 정규표현식 오류"
        res.send(result)
    } else{
        const sql1 = `SELECT * FROM user WHERE usernum = ? AND pw = ?;`
        const sqlValue1 = [usernum,pw]
        connection.query(sql1,sqlValue1,function(error,data){
            if(error){
                result.message = error
                res.send(result)
            }
            else{
               if(data.length){
                    const sql2 = `DELETE FROM user WHERE usernum = ?;`
                    const sqlValue2 = [usernum]
                    connection.query(sql2,sqlValue2,function(error){
                        if(error){
                            result.message = error
                            res.send(result)
                        }
                        else{
                            //db 오류를 어떻
                            result.success = data[0]
                            result.message = "계정탈퇴 성공"
                            res.send(result)
                        }
                    })
               }
               else{
                result.message = "비밀번호 불일치"
                res.send(result)
               }
            }
        })
    }
})
// 프로필보기
router.get("/:usernum",(req,res)=>{
    const {usernum} = req.params; // 어떤 아이디던 usernum을 인지하고 있음(2개의 api)
    const result = {
        "success" : false,
        "message" : "",
        "name" : "",
        "mail": "",
        "birth": "",
        "contact": ""
    }
    connection.query(`SELECT * FROM user WHERE usernum = ${usernum};`,function(error,data){
        if(error){
            result.message = error
            res.send(result)
        }
        else{
            if(data.length){
                result.success = true
                result.message = "프로필정보 불러오기 성공"
                result.name = data[0].name
                result.mail = data[0].mail
                result.birth = parseBirth(data[0].birth)
                result.contact = data[0].contact
                res.send(result)
            }
            else{
                result.message = "존재하지 않는 정보입니다."
                res.send(result)
            }
        }
    })
})
// 프로필수정
router.put("/",(req,res)=>{
    const {usernum,mail,birth,contact} = req.body; // 받아옴
    const result = {
        "success" : false,
        "message" : ""
    }
    if(!regex.mailRegex.test(mail)){
        result.message = "메일 정규표현식 오류"
        res.send(result)
    } else if(!regex.dateRegex.test(birth)){
        result.message = "날짜 정규표현식 오류 (yyyy/mm/dd)꼴로 적어주세요"
        res.send(result)
    } else if(!regex.contactRegex.test(contact)){
        result.message = "전화번호 정규표현식 오류 (숫자만 11자리 적어주세요)"
        res.send(result)
    } else{
        const email = mail;
        const atIndex = email.indexOf('@');

        const mailname = email.slice(0, atIndex);
        const domain = email.slice(atIndex);
        const sql = `SELECT * FROM user WHERE contact = ? OR mail = ?;`
        const sqlValue = [contact,mail]
        connection.query(sql,sqlValue,function(error,data){
            if(error){
                result.message = error
                res.send(result)
            }
            else{
                if(data.length && data[0].usernum != usernum){ // 중복체크
                    result.message = "이미 존재하는 메일이거나 전화번호입니다."
                    console.log("통과")
                    res.send(result)
                } else{
                    connection.query(`UPDATE user SET mail = '${mail}', birth = '${birth}', contact = '${contact}' WHERE usernum = ${usernum};`,function(error,data){
                        if(error){
                            result.message = error
                            res.send(result)
                        }
                        else{
                            result.success = true
                            result.message = "수정 완료"
                            res.send(result)
                        }
                    })
                }
            }
        })
    }  
})

const parseBirth = (date)=>{
    const time = new Date(date);
    console.log(date)
    return (time.getFullYear() +"/"+ (parseInt(time.getMonth())+1).toString() +"/"+ time.getDate())
}

module.exports = router