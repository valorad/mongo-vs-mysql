const mongoose = require("mongoose");
const mvm = require("../presenter/config");
// const fs = require('fs');
// const path = require('path');

mongoose.Promise = global.Promise;

//read settings synclly first
// const file = path.join(__dirname,'../config/mongoVSmysql.json');
// const siteConfig = JSON.parse(fs.readFileSync(file, 'utf8'));

// const mvm = siteConfig[0];

const mongoInstance = mongoose.connect(`mongodb://${ mvm.mongo.user }:${ mvm.mongo.password }@localhost/${ mvm.mongo.db }?authSource=${ mvm.mongo.authDB }`);

mongoose.connection
.once('open', () => {
    console.log(`Connection to ${ mvm.mongo.db } established successfully.`);
})
.on('error', (error) => {
    console.error(error);
})
;

module.exports = mongoInstance;
