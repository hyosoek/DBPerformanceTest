const mariadb = require('mysql')

const connection = mariadb.createConnection({
    host:'localhost',
    user:'hyoseok',
    password : '123123z',
    database : 'healthpartner'
})

module.exports = connection;