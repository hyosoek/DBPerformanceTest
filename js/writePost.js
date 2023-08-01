
const initEvent = () =>{
    console.log("hello")
}


const writePostEvent = async() =>{
    const response = await fetch("/post",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({
            "title": document.getElementById("title").value,
            "detail": document.getElementById("detail").value,
            "token":localStorage.getItem("token")
        })
    }) 
    const result = await response.json();
    if(result.success == true){
        localStorage.setItem("token",result.token)
        alert("작성완료")
        window.location.href = '/mainPage'
    }
    else{
        alert(result.message)
    }
}

initEvent()