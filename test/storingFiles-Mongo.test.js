const mongoInstance = require("../mongo/connection");
const fs = require('fs');
const path = require('path');
const grid = require('gridfs-stream');

const assert = require('assert');

//read settings synclly first
const fileData = path.join(__dirname,'../data/files.json');
const files = JSON.parse(fs.readFileSync(fileData, 'utf8'));

describe.skip("Mongo storing files", function() {
  this.slow(1*60*1000);
  this.timeout(5*60*1000);
  before((done) => {
    // runs before all tests in this block
    
    // drop everything in that db to continue tests
    mongoInstance.connection
    .once('connected', () => {
        mongoInstance.connection.db.dropDatabase();
        done();
    });
  });

  it('write all given files to mongo', (done) => {
      let gfs = grid(mongoInstance.connection.db, mongoInstance.mongo);
      // streaming to gridfs
      //filename to store in mongodb
      let i = 0; //counter
      let writestream;
      for (let file of files) {
        writestream = gfs.createWriteStream({
            filename: file.name
        });

        let filePath = path.join(__dirname, file.path, file.name);
        fs.createReadStream(filePath).pipe(writestream);
        i++;
      }
      writestream.on('close', function () {
          // do something with `file`
          console.log(i + " file(s) has been written To DB");
          done();
      });
  });



});
