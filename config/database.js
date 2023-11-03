//postgreSQL

require('dotenv').config({ path: "../.env" });

const pgConnect = {
    user : process.env.dbUser,
    host : process.env.dbHost,
    database : process.env.dbDatabase,
    password : process.env.dbPassword,
    port : process.env.dbPort
}


// module.exports = {connection,pgConnect};
module.exports = {pgConnect};
