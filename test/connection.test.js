"use strict";

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
        mysqlInstance.getConnection(function(err, connection) {
            // Do nothing, release the connection immediately
            if (err) throw error;
            connection.release();
        });
    });
});