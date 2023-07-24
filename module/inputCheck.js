const Configure = require('@sub0709/json-config');
const conf = Configure.load('config.json');

class inputCheck {
    constructor(input) {
      this.input = input;
      this.result = true;
      this.errMessage = ""
    }
  
    isEmpty = () => {
        if(this.input == ""){
            this.result = false;
            this.errMessage = "Empty input"
        }else if(this.input == null){
            this.result = false;
            this.errMessage =("Null input")
        }else if(this.input == undefined){
            this.result = false;
            this.errMessage =("Undefined input")
        }   
        return this;
    }
    
    isNull = () => {
      if(this.input == null){
          this.result = false;
          this.errMessage =("Null input")
      }  
      return this;
    }
  
    isUndefined = () => {
      if(this.input == undefined){
          this.result = false;
          this.errMessage =("Undefined input")
      }  
      return this;
    }

    isMinSize = (size) =>{
        if(this.input.length < size){
            this.result = false;
            this.errMessage =("Too short input")
        }  
        return this;
    }

    isMaxSize = (size) =>{
        if(this.input.length > size){
            this.result = false;
            this.errMessage =("Too Large input")
        }  
        return this;
    }

    isMail = () =>{
        const regex = new RegExp(conf.regex.email);
        if(regex.test(this.input) == false){
            this.result = false;
            this.errMessage = "Mail type error"
        }  
        return this;
    }

    isContact = () =>{
        const regex = new RegExp(conf.regex.contact);
        if(regex.test(this.input) == false){
            this.result = false;
            this.errMessage = "Contact type error"
        }  
        return this;
    }

    isDate = () =>{
        const regex = new RegExp(conf.regex.date);
        if(regex.test(this.input) == false){
            this.result = false;
            this.errMessage = "Date type error"
        }  
        return this;
    }

    isIP = () =>{
        const regex = new RegExp(conf.regex.ip);
        if(regex.test(this.input) == false){
            this.result = false;
            this.errMessage = "IP type error"
        }  
        return this;
    }
    
    isSameWith =(input2) =>{
        if(this.input != input2){
            this.result = false;
            this.errMessage = "Not same Input"
        }  
        return this;
    }

    
}

module.exports = inputCheck;