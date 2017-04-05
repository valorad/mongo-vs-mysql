//const mongoose = require("mongoose");
var mongoInstance;
var mysqlInstance;

describe("Mongo's turn", () => {
    it('connection to mongo', () => {
        mongoInstance = require("../mongo/connection");
    });
});

describe("MySQL's turn", () => {
    it('connection to mysql', () => {
        mysqlInstance = require("../mysql/connection");
        mysqlInstance.connect();
        mysqlInstance.end();
    });
});