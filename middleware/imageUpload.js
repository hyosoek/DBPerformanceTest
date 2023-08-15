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
      bucket: 'chsbucket4',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        cb(null, 'post/' + Date.now() + '-' + file.originalname);
      }
    }),
  });
  
module.exports = upload;
