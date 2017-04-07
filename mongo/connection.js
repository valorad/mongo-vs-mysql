const mongoose = require("mongoose");
const mvm = require("../presenter/config");

mongoose.Promise = global.Promise;

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
