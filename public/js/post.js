//왜 로컬 저장소를 쓰면 안될까?
//const receivedData = location.href.split('?')[1];
const postnum = localStorage.getItem("postNumTemp")
const commentnumList = []

let commentPageNum = 1
let commentPageMaxCount = 0
//전역변수는 프론트엔드가 알아서 해줄 것임.

let imgDeleteList = []
let imgAddList = []

window.onload =() =>{
    loadCommentMaxCount() //둘다 처음에 사용되지만, loadpost는 재사용되므로,
    loadPost()
}

// const testEvent =() =>{
//     document.getElementById("imageUrlCheckBtn").onclick = function(){
//         const str = document.getElementById("imageArea").src
//         if(str.endsWith("postPage")||str.endsWith("undefined")){
//             console.log("its null")
//         }else{
//             console.log("its not null")
//             console.log(str)
//         }
//     }
// }


const loadCommentMaxCount = () =>{
    fetch(`/comment/count?postnum=${postnum}`,{
        headers: {
            'Authorization': getCookie("token")
        }
    })
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        commentPageMaxCount = result.pagecount
    })
}

const loadPost = async() => {
    const response = await fetch(`/post?postnum=${postnum}`,{
        headers: {
            'Authorization': getCookie("token")
        }
    });
    const result = await response.json();
    if(result.success == false){ // 강제 리디렉션
        window.location.href = `/`;
    }

    document.getElementById("postTitle").innerText = result.title
    document.getElementById("postDate").innerText = result.date
    document.getElementById("postWriterName").innerText = result.name
    document.getElementById("postDetail").innerText = result.detail
    const imageContainer = document.getElementById("imageArea")

    console.log(result.imageUrlList[0])
    console.log(result.imageUrlList[1])

    if(result.imageUrlList){
        for(let i = 0 ; i < result.imageUrlList.length; i++){
            const img = document.createElement('img');
            img.src = result.imageUrlList[i]
            img.style.maxWidth = '200px';
            img.style.margin = '5px';
            img.id = "img" + (i+1)
            imageContainer.appendChild(img);
        }
    }

    loadComment()
}

const loadComment = async() => {
    document.getElementById("commentList").innerHTML = null
    const response = await fetch(`/comment?postnum=${postnum}&commentpagenum=${commentPageNum}`,{
        headers: {
            'Authorization': getCookie("token")
        }
    });
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
        commentnumList[i] = result.commentList[i].commentnum
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



const fixPostInitEvent = async() =>{
    //이미지 조절 부분
    const addImgBtn = document.createElement('input')
    addImgBtn.id = "addImgBtn"
    addImgBtn.type = "file"
    addImgBtn.accept = "image/*"


    addImgBtn.addEventListener('change', () => {
        if(document.getElementById("imageArea").childElementCount < 5){
            const file = addImgBtn.files[0]
            imgAddList.push(file)
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '200px';
            img.style.margin = '5px';
              
            img.onclick = function(){
                const indexToRemove = imgAddList.findIndex(item => item === file);
                imgAddList.splice(indexToRemove,1)
                document.getElementById("imageArea").removeChild(img)
            }
            document.getElementById("imageArea").appendChild(img);
        }
        console.log(imgDeleteList)
        console.log(imgAddList)
    });

    for(let i = 0 ; i < 5; i++){ // 5가 아니라 변수로 해야하는데 귀찮음.
        const img = document.getElementById("img"+(i+1))
        if(img){
            img.onclick = function(){
                document.getElementById("imageArea").removeChild(img)
                imgDeleteList.push(i)
                console.log(imgDeleteList)
                console.log(imgAddList)
            }
        }
    }

    document.getElementById('imageEditArea').appendChild(addImgBtn)
    
    //text data 부분
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
}   


const fixPostEvent = async() =>{
    let formData = new FormData();
    formData.append("title",document.getElementById("fixedTitle").value)
    formData.append("detail",document.getElementById("fixedDetail").value)
    formData.append("postnum",postnum)


    if(imgAddList){
        for (let i = 0; i < imgAddList.length; i++) {
            formData.append('images', imgAddList[i]);
        }
    }

    if(imgDeleteList){
        for (let i = 0; i < imgDeleteList.length; i++) {
            formData.append('deleteList', imgDeleteList[i]);
        }
    }

    fetch("/post",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "PUT",
        "headers":{
            'Authorization': getCookie("token")
        },
        "body":formData
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
            console.log(result)
            alert("권한이 없습니다.")
        }
    })
}
const deletePostEvent = async() =>{
    
    if(!confirm("정말 삭제하시겠습니까?")){
        alert("취소 되었습니다.")
    }else{
        fetch("/post",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
            "method" : "DELETE",
            "headers":{
                "Content-Type":"application/json",
                'Authorization': getCookie("token")
                    
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
                console.log(result)
                alert("삭제 실패")
            }
        })
    }
}
const writeCommentEvent = async() =>{
    const response = await fetch("/comment",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
        "headers":{
            "Content-Type":"application/json",
            'Authorization': getCookie("token") 
        },
        "body":JSON.stringify({
            "detail": document.getElementById("detail").value,
            "postnum": postnum
        })
    }) 
    const result = await response.json();
    if(result.success == true){
        alert("작성완료")
        window.location.href = '/postPage'
    }
    else{
        console.log(result)
        alert(result.message)
    }
}
const deleteCommentEvent = async() =>{
    const response = await fetch("/comment",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "DELETE",
        "headers":{
            "Content-Type":"application/json",
            'Authorization': getCookie("token")
        },
        "body":JSON.stringify({
            "commentnum" : commentnumList[0]
        })
    }) 
    const result = await response.json();
    if(result.success == true){
        alert("삭제완료")
        window.location.href = '/postPage'
    }
    else{
        console.log(result)
        alert(result.message)
    }
}

