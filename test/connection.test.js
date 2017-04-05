//const mongoose = require("mongoose");
var mongoInstance;

describe("make connection to databases", () => {
    it('connection to mongo', () => {
        mongoInstance = require("../mongo/connection");
    });
});