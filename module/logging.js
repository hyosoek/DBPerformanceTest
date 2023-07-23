
const logging = async() =>{//ip,id,api,rest,req,res
    await fetch("/log",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({
            "id" : "test1",
            "ip" : "1.1.1.5",
            "api" : "log",
            "rest" : "POST",
            "request" : {
                "a":"1",
                "b":"2"
            },
            "response" : {
                "c":"3",
                "d":"4"     
            }
        })
    }).then(

    )
}

module.exports = {logging}