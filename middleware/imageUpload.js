const multer = require('multer');
const path = require('path');
const AWS = require("aws-sdk");
const multerS3 = require('multer-s3');

AWS.config.update({
    "accessKeyId": process.env.AwsAccessKey,
    "secretAccessKey": process.env.AwsSecretAccessKey,
    "region": "ap-northeast-2"
})

const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AwsBucketName,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
        cb(null, 'post/' + Date.now() + `${fileName}${path.extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 용량 제한 설정
  })

const uploadTemp = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AwsBucketName,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
        cb(null, 'temp/' + Date.now() + `${fileName}${path.extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 용량 제한 설정
  })

const passImage = async(fileName) =>{
    await s3.copyObject({
        Bucket: `${process.env.AwsBucketName}/post`,
        CopySource: `/${process.env.AwsBucketName}/temp/${fileName}`,
        Key: `${fileName}`,
        ACL: 'public-read'
    }).promise();
}


const deleteImage = async(fileName) => {
    //const fileDir = 'post'
    let params = {
        Bucket: `${process.env.AwsBucketName}/post`,
        Key: `${fileName}`,
    }
    try {
        await s3.deleteObject(params)        
    } catch(err) {
        err.status = 500
        err.message = ("s3 access Error")
        throw err;
    }
}

  
  
module.exports = {upload,uploadTemp,deleteImage,passImage};
