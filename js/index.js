
const loginEvent = () =>{
    fetch("/account/log-in",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
        "mode": 'cors',
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({ 
            "id" : document.getElementById("id_value").value,
            "pw" : document.getElementById("pw_value").value
        })
    }) 
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        if(result.success){
            localStorage.setItem("token", result.token);
            window.location.href = `/mainPage?token=${localStorage.getItem("token")}`;
        }
        else{
            alert("아이디 또는 비밀번호가 올바르지 않습니다.")
        }
    })
}
const showFindIdPageEvent = () =>{
    window.location.href = '/findIdPage';
}
const showFindPwPageEvent = () =>{
    window.location.href = '/findPwPage';
}
const showSignUpPageEvent = () =>{
    window.location.href = '/signUpPage';
}