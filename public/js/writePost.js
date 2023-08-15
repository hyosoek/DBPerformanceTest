let file = null

window.onload = () =>{
    document.getElementById("finBtn").onclick = writePostEvent
    imageUploadEvnet()
}


const writePostEvent = async() =>{
    let formData = new FormData();

    formData.append("title",document.getElementById("title").value)
    formData.append("detail",document.getElementById("detail").value)

    if(file){
        formData.append('image', file);
        for (const entry of formData.entries()) {
            console.log(entry);
        }
    }
    
    const response = await fetch("/post",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
        "headers":{
            'Authorization': getCookie("token")
        },
        "body":formData
    }) 
    const result = await response.json();
    if(result.success == true){
        alert("작성완료")
        window.location.href = '/mainPage'
    }
    else{
        alert(result.message)
    }
}

const imageUploadEvnet = async() =>{
    const imageInput = document.getElementById('imageInput');
    const uploadedImage = document.getElementById('uploadedImage');
    imageInput.addEventListener('change', () => {
        file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                uploadedImage.src = event.target.result;
                uploadedImage.style.display = 'block';
            };
    
            reader.readAsDataURL(file);
        }
    });
}