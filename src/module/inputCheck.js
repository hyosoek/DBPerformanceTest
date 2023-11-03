const regexPatterns = require("../../config/regex.js");
const {BadRequestException} = require("../module/customError");

class inputCheck {
    constructor(input) {
        this.input = input;
        this.errMessage = ""
    }
  
    isEmpty = () => {
        if(this.input == ""){
            this.goError("Empty input")
        }else if(this.input == null){
            this.goError("Null input")
        }else if(this.input == undefined){
            this.goError("Undefined input")
        }
        return this;
    }
    
    isNull = () => {
      if(this.input == null){
        this.goError("Null input")
      }  
      return this;
    }
  
    isUndefined = () => {
      if(this.input == undefined){
        this.goError("Undefined input")
      }  
      return this;
    }

    isMinSize = (size) =>{
        if(this.input.length < size){
            this.goError("Too short input")
        }  
        return this;
    }

    isMaxSize = (size) =>{
        if(this.input.length > size){
            this.goError("Too Large input")
        }  
        return this;
    }

    isMail = () =>{
        if(regexPatterns.email.test(this.input) == false){
            this.goError("Mail type error")
        }  
        return this;
    }

    isContact = () =>{
        
        if(regexPatterns.contact.test(this.input) == false){
            this.goError("Contact type error")
        }  
        return this;
    }

    isDate = () =>{
        if(regexPatterns.date.test(this.input) == false){
            this.goError("Date type input")
        }  
        return this;
    }

    isIP = () =>{
        if(regexPatterns.ip.test(this.input) == false){
            this.goError("IP type input")
        }  
        return this;
    }
    
    isSameWith =(input2) =>{
        if(this.input != input2){
            this.goError("NOT same input")
        }  
        return this;
    }

    goError = (message) => {
        throw new BadRequestException(message);
    }
}

const isInputCheck = (input) => {
    const res = new inputCheck(input);
    return res;
}

module.exports = isInputCheck;