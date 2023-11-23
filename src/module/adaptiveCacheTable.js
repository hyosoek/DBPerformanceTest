const { log } = require("console");

const redis = require("redis").createClient();
require('dotenv').config({ path: "../../.env" });

// 자신이 속한 영역의 데이터 크기를 늘려줌
const setTable  = async(longitude,latitude) =>{
    const areaToken = await getAreaToken(longitude,latitude);
    await redis.connect()
    await redis.LPUSH(process.env.cacheTable,areaToken.toString())

    while(true){ // 데이터의 개수는 항상 100개로 제한합니다. // 1000개로 늘릴 생각이 있음.
        if(await redis.LLEN(process.env.cacheTable) > process.env.cacheTableMaxSize) await redis.RPOP(process.env.cacheTable)
        else break;
    }
    await redis.disconnect() //다시 접속할 가능성이 존재하기 때문에
}

const getInitArea = async(longitude,latitude) =>{ 
    const areaToken = await getAreaToken(longitude,latitude)
    await redis.connect()
    const data = await redis.LRANGE(process.env.cacheTable,0,-1)
    await redis.disconnect() //다시 접속할 가능성이 존재하기 때문에

    let areaTokenCount = 0;
    for(let i = 0; i < data.length; i++){
        if(parseInt(data[i]) == parseInt(areaToken)){
            areaTokenCount++;
        }
    }
    console.log(await percentageToLevel(((areaTokenCount / data.length) * 100).toFixed(1)))
    return await percentageToLevel(((areaTokenCount / data.length) * 100).toFixed(1))
    //area 반환
}

const percentageToLevel = async(percentage) =>{// 나중에 테이블 만들기
    const level = Math.floor(percentage/10)
    return level
}

const getAreaToken = async(longitude,latitude) => {
    const longDivideCount = parseInt(process.env.longitudeDivideCount)
    const latDivideCount = parseInt(process.env.latitudeDivideCount)
    const maxLongitude = parseFloat(process.env.koreanMaxLongitude)
    const minLongitude = parseFloat(process.env.koreanMinLongitude)
    const maxLatitude = parseFloat(process.env.koreanMaxLatitude)
    const minLatitude = parseFloat(process.env.koreanMinLatitude)

    const longRange = maxLongitude-minLongitude
    const latRange = maxLatitude-minLatitude

    longitude = longitude - minLongitude
    latitude = latitude - minLatitude

    let longArea = null
    let latArea = null

    if(longitude < 0){
        longArea = 0
        
    }else if(longitude >= longRange){
        longArea = longDivideCount + 1
    }else{
        const temp = (longRange / longDivideCount)
        longArea = Math.floor(longitude / temp) + 1//0이면 첫번째 구역이겠죠? 최대 몫이 얼마나 나오는가?
    }

    if(latitude < 0){
        latArea = 0
        
    }else if(latitude >= latRange){
        latArea = latDivideCount + 1
    }else{
        const temp = (latRange / latDivideCount)
        latArea = Math.floor(latitude / temp) + 1//0이면 첫번째 구역이겠죠? 최대 몫이 얼마나 나오는가?
    }

    const areaToken = (longArea * latDivideCount) + latArea;
    return parseInt(areaToken)
}

const zoomLevelToRange = async(level) => {
    
}


module.exports = {setTable,getInitArea,zoomLevelToRange}