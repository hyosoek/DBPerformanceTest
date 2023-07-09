const mariadb = require('mysql')
const {Client} = require("pg")

const connection = mariadb.createConnection({
    host:'localhost',
    user:'hyoseok',
    password : '123123z',
    database : 'healthpartner'
})

export const config = new Client({
    "user":"ubuntu",
    "password":"1234",
    "host":"localhost",
    "post":"5432",
    "database": "healthpartner" 
})

module.exports = connection;