window.onload = () =>{
    document.getElementById("findBtn").onclick = findID
}

const findID = async() =>{
    const nameInput = document.getElementById("nameInput").value
    const mailInput = document.getElementById("mailInput").value
    const response = await fetch(`/account/find-id?name=${nameInput}&mail=${mailInput}`);
    const result = await response.json();

    if(result.success == true){
        document.getElementById("resultId").innerText = "귀하의 아이디는 '" + result.id + "' 입니다"
    }
    else{
        document.getElementById("resultId").innerText = "존재하지 않는 아이디입니다"
    }
}

