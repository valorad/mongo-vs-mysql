'use strict';

const mysql = require('mysql2');
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
