const idRegex =/^[A-Za-z0-9]{4,32}$/
const pwRegex =/^[A-Za-z0-9!@#$%^&*()\-_=+\\|[\]{};:'",.<>/?`~]{4,32}$/
const nameRegex = /^[A-Za-z가-힣]{1,32}$/
const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const dateRegex = /^\d{4}\/\d{1,2}\/\d{1,2}$/
const contactRegex = /^\d{9,11}$/ //대쉬 고려해보기
const timeRegex = /^\d{4}-\d{2}-\d{2} $/
const postTitleRegex = /^.{1,32}$/
const postDetailRegex = /^.{1,1024}$/
const commentDetailRegex = /^.{1,512}$/

// if(!emailRegex.test(mail)){
//     regexTest = false
// }
// if(!dateRegex.test(date)){
//     regexTest = false
// }
// if(!contactRegex.test(contact)){
//     regexTest = false
// }

module.exports = {idRegex,pwRegex,nameRegex,
    mailRegex,dateRegex,contactRegex,timeRegex,postTitleRegex,postDetailRegex,commentDetailRegex}
 
