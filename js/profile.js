
const initProfileData = async() =>{
    const response = await fetch(`/account/${sessionStorage.getItem("usernum")}`);
    const result = await response.json();
    console.log(result)

    document.getElementById("name").innerText = result.name
    document.getElementById("mail").innerText = result.mail
    document.getElementById("birth").innerText = result.birth
    document.getElementById("contact").innerText = result.contact

    document.getElementById("fixBtn").onclick = profileFixInitEvent
    document.getElementById("withdrawalBtn").onclick = withdrawalEvent
}

const profileFixInitEvent = () =>{
    const informationIdList = ["mail","birth","contact"]
    
    for(let i = 0; i <informationIdList.length;i++){
        const information = document.getElementById(informationIdList[i])
        const replaceText = document.createElement('textarea');
        replaceText.id = "fixed" +informationIdList[i];
        replaceText.innerText = information.innerText;
        var container = document.getElementById('informationArea');
        container.replaceChild(replaceText, information);
    }
    const fixBtn = document.getElementById('fixBtn');
    fixBtn.value = "저장하기"
    fixBtn.onclick = null
    fixBtn.onclick = profileFixEvent
}

const profileFixEvent = () =>{
    fetch("/account",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "PUT",
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({
            "usernum": sessionStorage.getItem("usernum"),
            "mail": document.getElementById("fixedmail").value,
            "birth": document.getElementById("fixedbirth").value,
            "contact":  document.getElementById("fixedcontact").value
        })
    }) 
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result)
        if(result.success == true){
            alert("수정 완료")
            window.location.href = '/profilePage'
        }
        else{
            alert(result.message)
        }
    })
}



const withdrawalEvent = () =>{
    const requirePw = prompt("정말로 삭제하시려면 비밀번호를 입력해주세요")
    if(requirePw != null){
        fetch("/account",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
            "method" : "DELETE",
            "headers":{
                "Content-Type":"application/json"
            },
            "body":JSON.stringify({
                "usernum": sessionStorage.getItem("usernum"),
                "pw": requirePw
            })
        }) 
        .then((response) => {
            return response.json()
        })
        .then((result) => {
            if(result.success == true){
                alert("수정 완료")
                window.location.href = '/loginPage'
            }
            else{
                alert(result.message)
            }
        })
    }
}

initProfileData()
