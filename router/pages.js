const router = require("express").Router()
const path = require("path")

router.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, "../public/html/index.html")) 
})

router.get("/mainPage",(req,res)=>{ 
    res.sendFile(path.join(__dirname, "../public/html/mainPage.html")) //..을 계산해줌
})

router.get("/adminPage",(req,res)=>{
    res.sendFile(path.join(__dirname, `../public/html/adminPage.html`)) //..을 계산해줌
})

router.get("/findIdPage",(req,res)=>{
    res.sendFile(path.join(__dirname, `../public/html/findId.html`)) //..을 계산해줌
})

router.get("/findPwPage",(req,res)=>{
    res.sendFile(path.join(__dirname, "../public/html/findPw.html")) //..을 계산해줌
})

router.get("/signupPage",(req,res)=>{
    res.sendFile(path.join(__dirname, "../public/html/signUp.html")) //..을 계산해줌
})

router.get("/profilePage",(req,res)=>{
    res.sendFile(path.join(__dirname, "../public/html/profile.html")) //..을 계산해줌
})

router.get("/postPage",(req,res)=>{
    res.sendFile(path.join(__dirname, `../public/html/post.html`)) //..을 계산해줌
})

router.get("/writePostPage",(req,res)=>{
    res.sendFile(path.join(__dirname, `../public/html/writePost.html`)) //..을 계산해줌
})


module.exports = router