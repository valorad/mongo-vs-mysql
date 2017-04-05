// connection to mysql
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname,'../config/mongoVSmysql.json');
const siteConfig = JSON.parse(fs.readFileSync(file, 'utf8'));

const mvm = siteConfig[0];


// create connection

const mysqlInstance = mysql.createConnection({
  host     : mvm.host,
  user     : mvm.user,
  password : mvm.password,
  database : mvm.database
});

module.exports = mysqlInstance;
// has to call connect() and end() in further tests.
