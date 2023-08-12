//environment setting
const express =require("express")
const path = require("path")
const https = require("https")
const fs = require("fs") 
const log = require("./middleware/logging.js");
const schedule = require("./module/schedule.js")
const errorHandler = require("./middleware/errorhandling.js")

const redis = require("redis").createClient();


const app = express()
const sslOptions = {
    "key":fs.readFileSync(path.join(__dirname,"ssl/key.pem")),
    "cert": fs.readFileSync(path.join(__dirname,"ssl/cert.pem")),
    "passphrase" : "1234" 
}

app.use(express.json())
app.use(express.static("public"))
app.get("*",(req,res,next) =>{
    const protocol = req.protocol 
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

const visitorApi = require("./router/visitor")
app.use('/visitor', visitorApi);

app.use(log.logging)

app.use(errorHandler.errorPass)




//서버 시작
app.listen(8000,async() => {
    console.log("Web Server on PortNum:8000")
})

https.createServer(sslOptions,app).listen(8443,()=>{
    console.log("Web ssl Server on PortNum:8443")
})


 
