//environment setting
const express =require("express")
var session = require('express-session');
const path = require("path")
const https = require("https")
const fs = require("fs") 
const log = require("./module/logging.js");

const sslOptions = {
    "key":fs.readFileSync(path.join(__dirname,"ssl/key.pem")),
    "cert": fs.readFileSync(path.join(__dirname,"ssl/cert.pem")),
    "passphrase" : "1234" 
}
const sessionOptions = {
    secret: 'secret',
    saveUninitialized: true,
    cookie: { maxAge : 600000 },
    rolling : true,
    resave: true
}

//middleware with API
const app = express()

app.use(session(sessionOptions)); // 굳이 env 저장할 필요는 없는 듯

app.use(express.json())

app.use("/js",express.static(__dirname + "/js"))

app.get("*",(req,res,next) =>{ //next는 자동으로 넘어가줌
    const protocol = req.protocol //프로토콜을 가져올 수 있음
    if(protocol == "https"){
        next()
    } else{
        const destination = `https://${req.hostname}:8443${req.url}`
        res.redirect(destination)
    }
})

const loggingMiddleware = (req, res) => { //정의
    log.logging(req,res,next)
};


//API
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

const pages = require("./router/pages")
app.use("/",pages) 

app.use(loggingMiddleware); //api 호출 이후 next를 사용해주면 됨


//서버 시작
app.listen(8000,() => {
    console.log("Web Server on PortNum:8000")
})

https.createServer(sslOptions,app).listen(8443,()=>{
    console.log("Web ssl Server on PortNum:8443")
})


 
