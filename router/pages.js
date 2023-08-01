const router = require("express").Router()
const path = require("path")


//왜 모듈화하지 않았는가? = 각각 query parameter나 경로가 다를 수 있음 + 한눈에 보기 좋음 (정규표현식으로 가능은 할 거 같은데 굳이...?)
router.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, "../index.html")) //..을 계산해줌
})

router.get("/mainPage",async(req,res)=>{ // 세션체크해서 메인페이지가 관리자 페이지로 나뉨. 이건 프론트에서 다른 페이지 접근 불가(파일 위치의 영역)
    const data = await req.customData
    if(data.isAdmin == true){
        res.sendFile(path.join(__dirname, "../html/adminPage.html")) //..을 계산해줌
    } else{
        res.sendFile(path.join(__dirname, "../html/mainPage.html")) //..을 계산해줌
    }
})

router.get("/findIdPage",(req,res)=>{
    res.sendFile(path.join(__dirname, `../html/findId.html`)) //..을 계산해줌
})

router.get("/findPwPage",(req,res)=>{
    res.sendFile(path.join(__dirname, "../html/findPw.html")) //..을 계산해줌
})

router.get("/signupPage",(req,res)=>{
    res.sendFile(path.join(__dirname, "../html/signUp.html")) //..을 계산해줌
})

router.get("/profilePage",(req,res)=>{
    res.sendFile(path.join(__dirname, "../html/profile.html")) //..을 계산해줌
})

router.get("/postPage",(req,res)=>{
    //const {usernum} = req.params
    res.sendFile(path.join(__dirname, `../html/post.html`)) //..을 계산해줌
})

router.get("/writePostPage",(req,res)=>{
    //const {usernum} = req.params
    res.sendFile(path.join(__dirname, `../html/writePost.html`)) //..을 계산해줌
})
router.get("/adminPage",(req,res)=>{
    //const {usernum} = req.params
    res.sendFile(path.join(__dirname, `../html/adminPage.html`)) //..을 계산해줌
})


module.exports = router