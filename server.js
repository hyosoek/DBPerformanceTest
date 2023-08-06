//environment setting
const express =require("express")
var session = require('express-session');
const path = require("path")
const https = require("https")
const fs = require("fs") 
const log = require("./module/logging.js");
const verify = require("./module/verify.js")


const sslOptions = {
    "key":fs.readFileSync(path.join(__dirname,"ssl/key.pem")),
    "cert": fs.readFileSync(path.join(__dirname,"ssl/cert.pem")),
    "passphrase" : "1234" 
}

//middleware with API
const app = express()
app.use(express.json())
app.use(express.static("public"))
app.get("*",(req,res,next) =>{ //next는 자동으로 넘어가줌
    const protocol = req.protocol //프로토콜을 가져올 수 있음
    if(protocol == "https"){
        next()
    } else{
        const destination = `https://${req.hostname}:8443${req.url}`
        res.redirect(destination)
    }
})


//API
const pages = require("./router/pages")
app.use("/",pages) 

app.use(verify.verifyWithToken); 

const accountApi = require("./router/account")
app.use("/account", accountApi)

const profileApi = require("./router/profile")
app.use("/profile", profileApi)

const postApi = require("./router/post")
app.use("/post",postApi) 

const commentApi = require("./router/comment")
app.use("/comment",commentApi) 

const logRouterApi = require("./router/log")
app.use('/log', logRouterApi);

app.use(log.logging)


//서버 시작
app.listen(8000,() => {
    console.log("Web Server on PortNum:8000")
})

https.createServer(sslOptions,app).listen(8443,()=>{
    console.log("Web ssl Server on PortNum:8443")
})


 
