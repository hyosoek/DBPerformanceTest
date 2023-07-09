const express =require("express")
const app = express()
app.use(express.json())


const path = require("path")
const https = require("https")//통신 패키지
const fs = require("fs")// 파일 가져올 때 사용하는 패키지
var session = require('express-session');
 
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  cookie: { maxAge : 600000 },
  rolling : true
}));


const sslOptions = {
    "key":fs.readFileSync(path.join(__dirname,"ssl/key.pem")),
    "cert": fs.readFileSync(path.join(__dirname,"ssl/cert.pem")),
    "passphrase" : "1234" 
}
app.get("*",(req,res,next) =>{//next는 자동으로 넘어가줌
    const protocol = req.protocol //프로토콜을 가져올 수 있음
    if(protocol == "https"){
        next()
    } else{
        const destination = `https://${req.hostname}:8443${req.url}`
        res.redirect(destination)
    }

})

//API
const accountApi = require("./router/account")
app.use("/account", accountApi)

const postApi = require("./router/post")
app.use("/post",postApi) 

const commentApi = require("./router/comment")
app.use("/comment",commentApi) 

const pages = require("./router/pages")
app.use("/",pages) 

app.use("/js",express.static(__dirname + "/js"))

//서버 시작
app.listen(8000,() => {
    console.log("Web Server on PortNum:8000")
})

https.createServer(sslOptions,app).listen(8443,()=>{
    console.log("Web ssl Server on PortNum:8443")
})


 
