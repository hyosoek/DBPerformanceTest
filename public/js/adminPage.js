let cur = -1
let max = -1

window.onload = async() =>{
    document.getElementById("")
    await fetch(`/log?newest=${1}&id=${""}&pagenum=${1}`,{
        headers: {
            'Authorization': localStorage.getItem("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        if(result.auth)

        loadLogEvent(result)
        cur = 1
        setPage()
    })
}

const setPage = async() =>{
    document.getElementById("showPageNum").innerText = `${cur}/${max}페이지입니다.`
}

const loadLogEvent = async(result) =>{
    max = result.maxpage
    const data = result.data
    document.getElementById("logList").replaceChildren();
    for(let i =0;i<data.length;i++){
        var logItem = document.createElement("input");
        logItem.type="button";

        logItem.value = "id:   " + data[i].id  +"\n"+ "ip:   " + data[i].ip  + "\n"
                    + "api:   "+data[i].api  + "\n" +"REST:   "+ data[i].rest  + "\n"
                    + "REQ:   "+JSON.stringify(data[i].request,null)  + "\n" 
                    + "RES:   "+JSON.stringify(data[i].response,null)  + "\n"
                    + "TIME:   "+ data[i].time  + "\n"
        logItem.style.display = "block";
        logItem.style.backgroundColor = 'white';
        logItem.style.display = 'flex';
        logItem.style.justifyContent = 'flex-start';
        document.getElementById("logList").appendChild(logItem);
    }
}

const loadSearchEvent = async() =>{
    cur = 1;
    loadNewPageEvent(1)
}

const loadNewPageEvent = async(pagenum) =>{
    let isNewest = null
    if(document.getElementById("oldest").checked){
        isNewest = -1
    } else{
        isNewest = 1
    }
    await fetch(`/log?newest=${isNewest}&id=${document.getElementById("idInput").value}&pagenum=${pagenum}&token=${localStorage.getItem("token")}`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        localStorage.setItem("token",result.token)
        loadLogEvent(result) //무조건 최신순 10개 들어옵니다.
        setPage()
    })

}


const logOutEvent = async() =>{
    await fetch(`/account/log-out?token=${localStorage.getItem("token")}`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        try{
            window.location.href = '/loginPage';
        } catch{
            console.log("예상못한 에러 발생")
        }
    })
}

const loadBeforePageEvent = async() =>{
    if(cur == 1){
        alert("첫페이지임")
    } else{
        cur = cur - 1;
        loadNewPageEvent(cur);      
    }
}

const loadAfterPageEvent = async() =>{
    if(cur == max){
        alert("마지막페이지임")
    } else{
        cur = cur + 1;
        loadNewPageEvent(cur);
    }
}
