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
        this.goError(this.input + "is Null input")
      }  
      return this;
    }
  
    isUndefined = () => {
      if(this.input == undefined){
        this.goError(this.input + "is Undefined input")
      }  
      return this;
    }

    isMinSize = (size) =>{
        if(this.input.length < size){
            this.goError( this.input + "is Too short input")
        }  
        return this;
    }

    isMaxSize = (size) =>{
        if(this.input.length > size){
            this.goError(this.input + "is Too Large input")
        }  
        return this;
    }

    isMail = () =>{
        if(regexPatterns.mail.test(this.input) == false){
            this.goError(this.input + "is NOT Mail type")
        }  
        return this;
    }

    isContact = () =>{
        
        if(regexPatterns.contact.test(this.input) == false){
            this.goError(this.input + "is NOT Contact type")
        }  
        return this;
    }

    isDate = () =>{
        if(regexPatterns.date.test(this.input) == false){
            this.goError(this.input + "is NOT Date type input")
        }  
        return this;
    }

    isIP = () =>{
        if(regexPatterns.ip.test(this.input) == false){
            this.goError(this.input + "is Not IP type input")
        }  
        return this;
    }
    
    isEqual =(input2) =>{
        if(this.input != input2){
            this.goError(this.input + "is NOT same input")
        }  
        return this;
    }

    isInt = () =>{
        if(!Number.isInteger(this.input)){
            this.goError(this.input + "is NOT Int TYPE Input")
        }  
        return this;
    }

    isFinite = () =>{
        if(!Number.isFinite(this.input)){
            this.goError(this.input + "is NOT Finite TYPE Input")
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