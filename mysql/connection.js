'use strict';

const mysql = require('mysql');
const mvm = require("../presenter/config");

// create connection

const mysqlInstance = mysql.createPool({
  connectionLimit : 24,
  host     : mvm.mysql.host,
  user     : mvm.mysql.user,
  password : mvm.mysql.password,
  database : mvm.mysql.database
});

module.exports = mysqlInstance;
// has to call connect() and end() in further tests.
