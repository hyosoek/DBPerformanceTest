let cur = -1
let max = -1

const initEvent = async() =>{
    document.getElementById("")
    await fetch(`/log?newest=${1}&id=${""}&pagenum=${1}`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result)
        loadLogEvent(result.data) //무조건 최신순 10개 들어옵니다.
    })
    await fetch(`/log/maxpage?id=${""}`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result)
        cur = 1
        max = result.maxpage
        setPage()
    })
}

const setPage = async() =>{
    document.getElementById("showPageNum").innerText = `${cur}/${max}페이지입니다.`
}

const loadLogEvent = async(data) =>{
    document.getElementById("logList").replaceChildren();
    for(let i =0;i<data.length;i++){
        var logItem = document.createElement("input");
        logItem.type="button";

        logItem.value = "id:   " + data[i].id  +"\n"+ "ip:   " + data[i].ip  + "\n"
                    + "api:   "+data[i].api  + "\n" +"REST:   "+ data[i].rest  + "\n"
                    + "api:   "+data[i].api  + "\n" +"REST:   "+ data[i].rest  + "\n"
                    + "REQ:   "+JSON.stringify(data[i].request,null)  + "\n" 
                    + "RES:   "+JSON.stringify(data[i].response,null)  + "\n"
        logItem.style.display = "block";
        logItem.style.backgroundColor = 'white';
        document.getElementById("logList").appendChild(logItem);
    }
}

const loadNewPageEvent = async() =>{
    let isNewest = null
    if(document.getElementById("newest").checked){
        isNewest = 1
    } else if(document.getElementById("oldest").checked){
        isNewest = -1
    }

    document.getElementById("")
    await fetch(`/log?newest=${isNewest}&id=${document.getElementById("idInput").value}&pagenum=${1}`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result)
        loadLogEvent(result.data) //무조건 최신순 10개 들어옵니다.
    })
}


const logOutEvent = async() =>{
    await fetch(`/account/log-out`)
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



initEvent()