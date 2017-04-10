'use strict';

const mysqlInstance = require("../mysql/connection");
const files = require("../presenter/filePresent").files;
const fs = require('fs');
const path = require('path');
var mysqlConnection; // to store single copy from mysql conn pool

//read settings synclly first
// const fileData = path.join(__dirname,'../data/files.json');
// const files = JSON.parse(fs.readFileSync(fileData, 'utf8'));

describe.skip('MySQL storing files', function() {
  //this.slow(1*60*1000);
  this.timeout(5*60*1000);
  before((done) => {
    // runs before all tests in this block
    mysqlInstance.getConnection((err, connection) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        mysqlConnection = connection;
        console.log('connected as id ' + mysqlConnection.threadId);
        // drop everything in files table to continue tests
        mysqlConnection.query('TRUNCATE TABLE files', (error, results, fields) => {
            if (error) throw error;
            done();
        });
    });
  });

  it('MySQL stores all given file(s) to table', () => {
    console.log("## Begin test: MySQL stores all given file(s) to table");
    let timeStart = new Date().getTime();
    let i = 0; //counter
    for (let file of files) {
        let filePath = path.join(__dirname, file.path, file.name);
        let thisFile = {
            name: file.name,
            content: fs.readFileSync(filePath)
        }
        mysqlInstance.query('INSERT INTO files SET ?', thisFile, (err, result) => {
            if (err) { console.error(err) }
        });
        i++;
    }
    console.log(" --> " + i + " file(s) has been inserted into MySQL");
    console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
  });

//   after(function() {
//     // runs after all tests in this block
//     //mysqlConnection.release();

//   });
});