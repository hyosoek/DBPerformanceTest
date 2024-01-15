//postgreSQL

require('dotenv').config({ path: "../.env" });

const pgConnect = {
    user : process.env.DBUSER,
    host : process.env.DBHOST,
    database : process.env.DBDATABASE,
    password : process.env.DBPASSWORD,
    port : process.env.DBPORT
}


// module.exports = {connection,pgConnect};
module.exports = {pgConnect};
