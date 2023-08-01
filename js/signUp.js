
const initEvent = () =>{
    const signUpBtn = document.getElementById("signUpBtn")
    signUpBtn.disabled = true
    const idCheckBtn = document.getElementById("idCheckBtn")
    idCheckBtn.onclick = idCheck
}

const idCheck = async() =>{
    const id = document.getElementById("idInput").value
    const response = await fetch(`/account/id-exist?id=${id}&token=${localStorage.getItem("token")}`);
    
    const result = await response.json();
    localStorage.setItem("token",result.token)
    if(result.success == true){
        alert(result.message)
        document.getElementById("idInput").disabled = true
        signUpBtn.disabled = false
        document.getElementById("signUpBtn").onclick = signUpEvent
    } else{
        alert(result.message)
    }
}

const signUpEvent = async() =>{
    const response = await fetch("/account",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({
            "id": document.getElementById("idInput").value,
            "pw1": document.getElementById("pwInput1").value,
            "pw2": document.getElementById("pwInput2").value,
            "name" : document.getElementById("nameInput").value,
            "mail": document.getElementById("mailInput").value,
            "birth": document.getElementById("birthInput").value,
            "contact": document.getElementById("contactInput").value,
            "token":localStorage.getItem("token")
        })
    }) 
    const result = await response.json();
    if(result.success == true){
        localStorage.setItem("token",result.token)
        alert("가입완료")
        window.location.href = '/loginPage'
    }
    else{
        alert(result.message)
    }
}

initEvent()