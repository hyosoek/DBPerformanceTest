const getEvent = () =>{
    fetch("/account/16")
    .then((response) => {
        return response.json()
    })
    .then((result) => {
        console.log(result)
    })
}
const loginEvent = () =>{
    fetch("/account/log-in",{// get빼고 이거 3개는 전부 이렇게 해주기 //Get은 body를 못 넣어줌
        "method" : "POST",
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
        console.log(result)
        if(result.success){
            sessionStorage.setItem('usernum', result.userNum);
            window.location.href = '/mainPage';
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