const redis = require("redis").createClient();
require('dotenv').config({ path: "../../.env" });

module.exports = {
    getRelativeAscTier : async(dataset, data) =>{
        //data = 1
        let index = null;
        for(let i = 0; i < dataset.length;i++){
            if(parseFloat(dataset[i].data) >= parseFloat(data)){
                index = i
                break
            }
        }
        const percentile = (index / dataset.length) * 100;
        const temp = Math.round(percentile);
        let tier = null

        if(temp <= 4){
            tier = 1
        }else if(temp <= 11){
            tier = 2
        }else if(temp <= 23){
            tier = 3
        }else if(temp <= 40){
            tier = 4
        }else if(temp <= 60){
            tier = 5
        }else if(temp <= 77){
            tier = 6
        }else if(temp <= 89){
            tier = 7
        }else if(temp <= 96){
            tier = 8
        }else if(temp <= 100){
            tier = 9
        }else{
            err = new Error();
            err.message = "Invalid tier!"
            throw err
        }
        return {"tier" : tier, "percentage" : temp}
    },

    getRelativeDescTier : async(dataset, data) =>{
        let index = 0;
        console.log(dataset.length)
        console.log(data)
        for(let i = 0; i < dataset.length;i++){
            if(parseFloat(dataset[i].data) <= parseFloat(data)){
                index = i
                break
            }
        }
        const percentile = (index / dataset.length) * 100;
        const temp = Math.round(percentile);
        let tier = null

        if(temp <= 4){
            tier = 1
        }else if(temp <= 11){
            tier = 2
        }else if(temp <= 23){
            tier = 3
        }else if(temp <= 40){
            tier = 4
        }else if(temp <= 60){
            tier = 5
        }else if(temp <= 77){
            tier = 6
        }else if(temp <= 89){
            tier = 7
        }else if(temp <= 96){
            tier = 8
        }else if(temp <= 100){
            tier = 9
        }else{
            err = new Error();
            err.message = "Invalid tier!"
            throw err
        }
        return {"tier" : tier, "percentage" : temp}
    }
}