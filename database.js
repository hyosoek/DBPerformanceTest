// const mariadb = require('mysql')

// const connection = mariadb.createConnection({
//     host:'localhost',
//     user:'hyoseok',
//     password : '123123z',
//     database : 'healthpartner'
// })

const pgConnect ={
        user : 'ubuntu',
        host : 'localhost',
        database : 'healthpartner',
        password : '1234',
        port : 5432
    }


// module.exports = {connection,pgConnect};
module.exports = {pgConnect};
