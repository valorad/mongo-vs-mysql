"use strict";

const fs = require('fs');
const path = require('path');

//read settings synclly first
const file = path.join(__dirname,'./config/mongoVSmysql.json');
const siteConfig = JSON.parse(fs.readFileSync(file, 'utf8'));

const mvm = siteConfig[0];

module.exports = mvm;