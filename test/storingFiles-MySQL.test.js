'use strict';

const mysqlInstance = require("../mysql/connection");
const files = require("../presenter/filePresent").files;
const formFileList = require("../presenter/filePresent").formFileList;
const fs = require('fs');
const path = require('path');
var mysqlConnection; // to store single copy from mysql conn pool


describe('MySQL storing files', function() {
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

  it.skip('MySQL stores all given file(s) to table', (done) => {
    console.log("## Begin test: MySQL stores all given file(s) to table");
    let timeStart = new Date().getTime();
    let i = 0; //counter
    for (let file of files) {
      let filePath = path.join(__dirname, file.path, file.name);
      let thisFile = {
        name: file.name,
        content: fs.readFileSync(filePath)
      }
      let base64Content = Buffer.from(thisFile.content, 'binary').toString('base64');

      //mysqlConnection.query(`INSERT INTO files SET name="${thisFile.name}", content="${Buffer((thisFile.content), 'utf8')}"`, (err, result) => {
      // preparing insert query
      let sql = "INSERT INTO files (name, content) VALUES (?, ?)";
      let inserts = [thisFile.name, base64Content];
      sql = mysqlConnection.format(sql, inserts);

      // start inserting
      mysqlConnection.query(sql,  (err, result) => {
        if (err) { console.error(err) }
        
        console.log("#inserted file " + i);
        i++;

        if (i >= files.length) {
          //so it's the last file mysql is handling with
          console.log(" --> " + i + " file(s) has been inserted into MySQL");
          console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
          done();
        }
      });
    }
  });

  it('MySQL inserts all file(s) under folder(s)', function(done) {
    console.log("## Begin test: MySQL inserts all file(s) under single(multiple) folder(s)");
    let timeStart = new Date().getTime();

    formFileList.then((fileList) => {
      // after file list build up, mysql starts inserting files

      console.log(`  -- MySQL has got ${fileList.fileNum} file(s) under ${fileList.folderNum} folder(s) --`);

      if (fileList.fileNum > 0) {
        // mysql will insert files only when there is a file

        let i = 0; // local file number counter

        for (let file of fileList.files) {
          let filePath = path.join(file.path, file.name);
          let thisFile = {
            name: file.name,
            content: fs.readFileSync(filePath)
          }
          let base64Content = Buffer.from(thisFile.content, 'binary').toString('base64');

          // preparing insert query
          let sql = "INSERT INTO files (name, content) VALUES (?, ?)";
          let inserts = [thisFile.name, base64Content];
          sql = mysqlConnection.format(sql, inserts);

          // start inserting
          mysqlConnection.query(sql,  (err, result) => {
            if (err) { console.error(err) }
            
            console.log("#inserted file " + i);
            i++;

            if (i >= fileList.files.length) {
              //so it's the last file mysql is handling with
              console.log(" --> " + i + " file(s) has been inserted into MySQL");
              console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
              done();
            }
          });
        }

      } else {
        console.warn("-------------------------------------------------------");
        console.warn("--- Warning! There is nothing in the given folder! ---");
        console.warn("-------------------------------------------------------");
        console.log(" --> " + fileList.fileNum + " file(s) under " + fileList.folderNum + " folder(s) has been inserted into MySQL");
        console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms.");
        done();
      }

    });

  });

  after(function() {
    // runs after all tests in this block
    mysqlConnection.release();

  });
});