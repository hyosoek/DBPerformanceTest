//clog test
var bodyParser = require('body-parser')

//environment setting
const express =require("express")
const path = require("path")
const https = require("https")
const fs = require("fs")
const cookieParser = require('cookie-parser');

const redis = require("redis").createClient();
const errorHandler = require("./middleware/errorhandling.js")

const app = express()
const sslOptions = {
    "key":fs.readFileSync(path.join(__dirname,"../ssl/key.pem")),
    "cert": fs.readFileSync(path.join(__dirname,"../ssl/cert.pem")),
    "passphrase" : "1234" 
}
const server = https.createServer(sslOptions,app)

app.use(express.urlencoded( {extended : true } ));
app.use(express.json()) // 타입 변환(req에 대한 body-parser)
app.use(express.static('../'));
app.use(cookieParser());

const cors = require("cors");
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

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
// app.use("/postgre", require("./router/postgresql"))
// app.use("/account", require("./router/mariadb"))
const postgreTestObject = new (require('./testing/ptest'))('John');


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


 
