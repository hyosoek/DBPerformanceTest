//전역변수는 프론트엔드가 알아서 해줄 것임.
//원래는 매개변수가 맞지만 귀찮음
let pageNum = 1
let pageMaxCount = 0


window.onload = () =>{
    loadPage(pageNum) // 페이지 불러오면 무조건 실행됨
    document.getElementById("showProfileBtn").onclick = showProfilePageEvent
    document.getElementById("logoutBtn").onclick = logOutEvent
    document.getElementById("beforePageBtn").onclick = loadBeforePostPageEvent
    document.getElementById("afterPageBtn").onclick = loadAfterPostPageEvent
    document.getElementById("writePostBtn").onclick = writePostPageEvent
} 

const loadPage = (pageNum) =>{
    fetch(`/post/count`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        if(result.auth == true){
            pageMaxCount = result.pagecount
            loadPostPage(pageNum)
        } else{
            window.location.href = `/`;
        }
    })
}

//Event
const loadPostPage = (pageNum) =>{
    fetch(`/post/list?pagenum=${pageNum}`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        localStorage.setItem("token",result.token)
        document.getElementById("postboard").innerHTML = null
        for (let i = 0;i < result.postList.length; i++){
            document.getElementById("postboard")
            var postItem = document.createElement("input");
            postItem.type="button";
            postItem.value = result.postList[i].title +"\t"+ result.postList[i].date +"\t"+ result.postList[i].name
            postItem.id = result.postList[i].postnum
            postItem.style.display = "block";
            postItem.style.backgroundColor = 'white';
            document.getElementById("postboard").appendChild(postItem);

            postItem.addEventListener('click', showPostPageEvent(result.postList[i].postnum))
        }
        document.getElementById("showPageNum").innerText = (pageNum +"/"+pageMaxCount+"페이지")
    })
}

const loadBeforePostPageEvent = () =>{
    if(pageNum != 1){
        pageNum = pageNum - 1
        loadPostPage(pageNum)
    }
}

const loadAfterPostPageEvent = () =>{
    if(pageNum != pageMaxCount){
        pageNum = pageNum +1
        loadPostPage(pageNum)
    }
}

const logOutEvent = () =>{
    fetch(`/account/log-out`,{
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

const showProfilePageEvent = () =>{
    window.location.href = `/profilePage?token=${localStorage.getItem("token")}`;
}

const showPostPageEvent = (postnum)=>{
    return function(event) {
        localStorage.setItem("postNumTemp", postnum);
        window.location.href = `/postPage?token=${localStorage.getItem("token")}`;
    }
}

const  writePostPageEvent = ()=>{
    window.location.href = `/writePostPage`;
}


