const express =require("express")
const app = express()
app.use(express.json())

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
const server = app.listen(8000,() => {
    console.log("Web Server on PortNum:8000")
})

 
