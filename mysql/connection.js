'use strict';

const mysql = require('mysql');
const mvm = require("../presenter/config");
// const fs = require('fs');
// const path = require('path');

// const file = path.join(__dirname,'../config/mongoVSmysql.json');
// const siteConfig = JSON.parse(fs.readFileSync(file, 'utf8'));

// const mvm = siteConfig[0];

// create connection

const mysqlInstance = mysql.createPool({
  connectionLimit : 8888888,
  host     : mvm.mysql.host,
  user     : mvm.mysql.user,
  password : mvm.mysql.password,
  database : mvm.mysql.database
});

module.exports = mysqlInstance;
// has to call connect() and end() in further tests.
