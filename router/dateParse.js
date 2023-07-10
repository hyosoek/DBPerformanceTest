const showTimeLapse =(date) =>{
    const today = new Date();
    const time = new Date(date);
    const betweenTime = Math.floor((today.getTime() - time.getTime()) / 1000 / 60);
    if (betweenTime < 1) {
        return ("방금전")
    }else if (betweenTime < 60) {
        return (`${betweenTime}분전`) 
    }else if (Math.floor(betweenTime / 60) < 24) {
        return (`${Math.floor(betweenTime / 60)}시간전`) 
    }else if (Math.floor(betweenTime / 60 / 24) < 7) {
        return (`${Math.floor(betweenTime / 60 / 24)}일전`) 
    } else{
        return (time.getFullYear() +"/"+ (parseInt(time.getMonth())+1).toString() +"/"+ time.getDate())
    }
}

module.exports = {showTimeLapse}