//environment setting
const express =require("express")
const path = require("path")
const https = require("https")
const fs = require("fs") 

const redis = require("redis").createClient();
const errorHandler = require("./middleware/errorhandling.js")

const morgan = require("morgan");
const logger = require("./module/logger");
const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : combined; // NOTE: morgan 출력 형태 server.env에서 NODE_ENV 설정 production : 배포 dev : 개발
//const morganFormat = 'combined'; 

const app = express()
const sslOptions = {
    "key":fs.readFileSync(path.join(__dirname,"../ssl/key.pem")),
    "cert": fs.readFileSync(path.join(__dirname,"../ssl/cert.pem")),
    "passphrase" : "1234" 
}
const server = https.createServer(sslOptions,app)

app.use(morgan(morganFormat, { stream: logger.stream })); // morgan 로그 설정 
app.use(express.json())
app.use(express.static('../'));

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
app.use("/account", require("./router/account"))
app.use("/main", require("./router/main"))

// const postApi = require("./router/appliance")
// app.use("/appliance",postApi) 

// const commentApi = require("./router/recommend")
// app.use("/recommend",commentApi) 

// app.use(log.logging) // 로깅 없앨 것

app.use(function (err, req, res, next) {
    errorHandler.errorPass(err,req,res)
});

app.use(errorHandler.error404Pass);

//서버 시작
app.listen(8000,async() => {
    console.log("Web Server on PortNum:8000")
})

server.listen(8443,()=>{
    console.log("Web ssl Server on PortNum:8443")
})


 
