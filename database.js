//mariaDB
// const mariadb = require('mysql')
// const connection = mariadb.createConnection({
//     host:'localhost',
//     user:'hyoseok',
//     password : '123123z',
//     database : 'healthpartner'
// })

//postgreSQL
require('dotenv').config();

const pgConnect ={
        user : process.env.dbUser,
        host : process.env.dbHost,
        database : process.env.dbDatabase,
        password : process.env.dbPassword,
        port : process.env.dbPort
}


// module.exports = {connection,pgConnect};
module.exports = {pgConnect};
