//전역변수는 프론트엔드가 알아서 해줄 것임.
//원래는 매개변수가 맞지만 귀찮음
let pageNum = 1
let pageMaxCount = 0

const loadPostPage = (pageNum) =>{
    fetch(`/post/list?pagenum=${pageNum}`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result.postList)
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


const loadBeforePostPage = () =>{
    if(pageNum != 1){
        pageNum = pageNum - 1
        loadPostPage(pageNum)
    }
}

const loadAfterPostPage = () =>{
    if(pageNum != pageMaxCount){
        pageNum = pageNum +1
        loadPostPage(pageNum)
    }
}

const loadPageMaxCount = (pageNum) =>{
    fetch(`/post/count`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result)
        pageMaxCount = result.pagecount
        loadPostPage(pageNum)
    })
}

const logOutEvent = () =>{
    fetch(`/account/log-out`)
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

const showProfilePageEvent = () =>{
    window.location.href = '/profilePage';
}

const showPostPageEvent = (postnum)=>{
    return function(event) {
        localStorage.setItem("postNumTemp", postnum);
        window.location.href = `/postPage`;
    }
}

const  writePostPage = ()=>{
    window.location.href = `/writePostPage`;
}



loadPageMaxCount(pageNum) //둘다 처음에 사용되지만, loadpost는 재사용되므로,
//loadPostPage(pageNum)
