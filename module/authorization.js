
const adminCheck = async(req) =>{
    try{
        if(req.decoded.isAdmin == false || !req.decoded){
            return true
        }else{
            return false
        }
    }catch(err){
        console.log(`Authorization adminCheck Error : ${err.message}`)
    }
}

const userCheck = async(req) =>{
    
    try{
        if(req.decoded.isAdmin == true || !req.decoded){
            return true
        }else{
            return false
        }
    }catch(err){
        console.log(`Authorization userCheck Error : ${err.message}`)
    }
}

const authCheck  = async(req) =>{ // 유저 상관 없이 그냥 권한이 있는지만
    try{
        if(!req.decoded){
            return true
        }else{
            return false
        }
    }catch(err){
        console.log(`Authorization adminCheck Error : ${err.message}`) 
    }
}

module.exports = {adminCheck,userCheck,authCheck}