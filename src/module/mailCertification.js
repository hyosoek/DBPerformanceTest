const redis = require("redis").createClient();
require('dotenv').config({ path: "../../.env" });

const { error } = require("console");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.mailUser,
      pass: process.env.mailPass
    },
  });

const generateRandom = function (min, max) {
    const ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
}

const sending = async(mailAddress) => {
    const certNum = generateRandom(111111,999999);
    await redis.connect();
    await redis.set(mailAddress+process.env.mailCert, certNum.toString());
    await redis.expire(mailAddress+process.env.mailCert, process.env.mailExpireTime);
    
    redis.disconnect()

    const mailOptions = {
        from: `tennfin1@gmail.com`, //송신할 이메일
        to: mailAddress, //수신할 이메일
        subject: `ecosave 인증번호`,
        html: `귀하의 인증번호는 ${certNum}입니다.`
    };
    await transporter.sendMail(mailOptions)
}

const certification = async(mailAddress,certNum) =>{
    await redis.connect();
    const data = await redis.get(mailAddress+process.env.mailCert)
    // console.log(mailAddress+process.env.mailCert)
    // console.log(data)
    redis.disconnect()
    
    if(data == certNum) {
        return true;
    }
    else return false;
}


module.exports = {sending,certification}