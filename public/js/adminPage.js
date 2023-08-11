let cur = -1
let max = -1

window.onload = async() =>{
    loadSearchEvent()

    await fetch(`/log?newest=${1}&id=${""}&pagenum=${1}`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        if(result.sucess == true){
            loadLogEvent(result)
            cur = 1
            setPage()
        } else{
            window.location.href = `/`;
        }
    })

    await fetch(`/visitor`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        document.getElementById("todayVisitor").innerText = `${result.todaycount}번`
        document.getElementById("totalVisitor").innerText = `${result.totalcount}번`
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
    await loadNewPageEvent(1)
    await fetch(`/log/search-history`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        document.getElementById("searchHistoryArea").replaceChildren();
        for(let i =0;i<result.data.length;i++){
            var searchHistory = document.createElement("input");
            searchHistory.type="button";
    
            searchHistory.value = result.data[i]
            searchHistory.style.display = "block";
            searchHistory.style.backgroundColor = 'white';
            searchHistory.style.display = 'flex';
            searchHistory.style.justifyContent = 'flex-start';
            document.getElementById("searchHistoryArea").appendChild(searchHistory);
        }
    }) 
}

const loadNewPageEvent = async(pagenum) =>{
    let isNewest = null
    if(document.getElementById("oldest").checked){
        isNewest = -1
    } else{
        isNewest = 1
    }
    await fetch(`/log?newest=${isNewest}&id=${document.getElementById("idInput").value}&pagenum=${pagenum}`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        loadLogEvent(result) // 최신순 10개 들어옵니다.
        setPage()
    })

}

const logOutEvent = async() =>{
    await fetch(`/account/log-out`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        try{
            deleteCookie("token")
            window.location.href = '/';
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

const deleteSearchHistoryEvent = async() =>{
    fetch("/log/search-history",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "DELETE",
        "headers":{
            "Content-Type":"application/json",
            'Authorization': getCookie("token")      
        }
    }) 
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        if(result.success == true){
            alert("삭제 완료")
            document.getElementById("searchHistoryArea").replaceChildren();
        }
        else{
            alert("삭제 실패")
        }
    })
}
