//const mongoose = require("mongoose");
var mongoInstance;
var mysqlInstance;

describe.skip("Mongo's turn", () => {
    it('connection to mongo', () => {
        mongoInstance = require("../mongo/connection");
    });
});

describe.skip("MySQL's turn", () => {
    it('connection to mysql', () => {
        mysqlInstance = require("../mysql/connection");
        mysqlInstance.connect();
        mysqlInstance.end();
    });
});