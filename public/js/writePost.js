
window.onload = () =>{
    document.getElementById("finBtn").onclick = writePostEvent
}


const writePostEvent = async() =>{
    const response = await fetch("/post",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
        "headers":{
            "Content-Type":"application/json",
            'Authorization': getCookie("token")
        },
        "body":JSON.stringify({
            "title": document.getElementById("title").value,
            "detail": document.getElementById("detail").value
        })
    }) 
    const result = await response.json();
    if(result.auth == false){ // 강제 리디렉션
        window.location.href = `/`;
    }
    if(result.success == true){
        alert("작성완료")
        window.location.href = '/mainPage'
    }
    else{
        alert(result.message)
    }
}
