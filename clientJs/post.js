//왜 로컬 저장소를 쓰면 안될까?
//const receivedData = location.href.split('?')[1];
const postnum = localStorage.getItem("postNumTemp")

console.log(postnum)
let commentPageNum = 1
let commentPerPage = 3
let commentPageMaxCount = 0
//전역변수는 프론트엔드가 알아서 해줄 것임.

//promise 쓰지 말아보자

const loadPost = async() => {
    const response = await fetch(`/post/${postnum}`);
    const result = await response.json();

    document.getElementById("postTitle").innerText = result.title
    document.getElementById("postDate").innerText = result.date
    document.getElementById("postWriterName").innerText = result.name
    document.getElementById("postDetail").innerText = result.detail

    loadComment()
}

const loadComment = async() => {
    document.getElementById("commentList").innerHTML = null
    const response = await fetch(`/comment/${postnum}/${commentPageNum}/${commentPerPage}`);
    const result = await response.json();

    for(let i = 0; i < result.commentList.length;i++){
        document.getElementById("commentList")
        var postItem = document.createElement("input");
        postItem.type="button";

        postItem.value = result.commentList[i].detail +"\t"+ result.commentList[i].date +"\t"+ result.commentList[i].name
        postItem.id = result.commentList[i].postnum
        postItem.style.display = "block";
        postItem.style.backgroundColor = 'white';
        document.getElementById("commentList").appendChild(postItem);
    }
    document.getElementById("showPageNum").innerText = (commentPageNum +"/"+commentPageMaxCount+"페이지")

}

const loadBeforeCommentPage = () =>{
    if(commentPageNum != 1){
        commentPageNum = commentPageNum - 1
        loadComment()
    }
}
const loadAfterCommentPage = () =>{
    if(commentPageNum != commentPageMaxCount){
        commentPageNum = commentPageNum + 1
        loadComment()
    }
}

const loadCommentMaxCount = () =>{
    fetch(`/comment/count/${commentPerPage}/${postnum}`)
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result.pagecount)
        commentPageMaxCount = result.pagecount
    })
}

const fixPostInitEvent = async() =>{
    console.log(sessionStorage.getItem("usernum"))
    const response = await fetch(`/post/certification/${postnum}/${sessionStorage.getItem("usernum")}`);
    const result = await response.json();
    console.log(result)
    if(result.success == true){
        const postTitle = document.getElementById('postTitle');
        const replaceTitle = document.createElement('textarea');
        replaceTitle.id = "fixedTitle";
        replaceTitle.innerText = postTitle.innerText;
        var container = document.getElementById('titleArea');
        container.replaceChild(replaceTitle, postTitle);

        const postDetail = document.getElementById('postDetail');
        const replaceDetail = document.createElement('textarea');
        replaceDetail.id = "fixedDetail"
        replaceDetail.innerText = postDetail.innerText;
        var container = document.getElementById('detailArea');
        container.replaceChild(replaceDetail, postDetail);
        replaceDetail.focus();

        const fixBtn = document.getElementById('fixBtn');
        fixBtn.value = "저장하기"
        fixBtn.onclick = null
        fixBtn.onclick = fixPostEvent
    }else{
        alert("권한이 없습니다.")
    }
}   

const fixPostEvent = async() =>{
    fetch("/post",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "PUT",
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({
            "title" : document.getElementById("fixedTitle").value,
            "detail": document.getElementById("fixedDetail").value,
            "postnum": postnum
        })
    }) 
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result)
        if(result.success == true){
            alert("수정 완료")
            window.location.href = '/postPage'
        }
        else{
            alert("삭제 실패")
        }
    })
}


const deletePostEvent = async() =>{
    const response = await fetch(`/post/certification/${postnum}/${sessionStorage.getItem("usernum")}`);
    const result = await response.json();
    if(result.success){
        if(!confirm("정말 삭제하시겠습니까?")){
            alert("취소 되었습니다.")
        }else{
            fetch("/post",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
                "method" : "DELETE",
                "headers":{
                    "Content-Type":"application/json"
                },
                "body":JSON.stringify({
                    "postnum" : postnum
                })
            }) 
            .then((response) => {
                return response.json()
            })
            .then((result) => {
                console.log(result)
                if(result.success == true){
                    alert("삭제 완료")
                    window.location.href = '/mainPage'
                }
                else{
                    alert("삭제 실패")
                }
            })
        }
    }else{
        alert("권한이 없습니다.")
    }
}

loadCommentMaxCount() //둘다 처음에 사용되지만, loadpost는 재사용되므로,
loadPost()
