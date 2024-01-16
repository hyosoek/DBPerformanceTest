//postgreSQL

require('dotenv').config({ path: "../.env" });
const { Pool } = require("pg");

const client = new Pool({
    user : process.env.DBUSER,
    host : process.env.DBHOST,
    database : process.env.DBDATABASE,
    password : process.env.DBPASSWORD,
    port : process.env.DBPORT,
    max: 20
});


// module.exports = {connection,pgConnect};
module.exports = client;