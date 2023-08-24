let files = []

window.onload = () =>{
    document.getElementById("finBtn").onclick = writePostEvent
    imageUploadEvnet()
}


const writePostEvent = async() =>{
    let formData = new FormData();

    formData.append("title",document.getElementById("title").value)
    formData.append("detail",document.getElementById("detail").value)

    if(files){
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
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
    const imageContainer = document.getElementById('imageContainer');
    imageInput.addEventListener('change', () => {
        if(files.length < 5){
            const file = imageInput.files[0] 
            files.push(file)
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '200px';
            img.style.margin = '5px';
            imageContainer.appendChild(img);
    
            console.log(files)
        }
    });
}