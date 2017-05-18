'use strict';

const mysqlInstance = require("../mysql/connection");
const files = require("../presenter/filePresent").files;
const formFileList = require("../presenter/filePresent").formFileList;
const fs = require('fs');
const path = require('path');
var mysqlConnection; // to store single copy from mysql conn pool

const _1MB = 1*1024*1024;
const _110MB = 110*_1MB;
const _100MB = 100*_1MB;
const _20MB = 20*_1MB;
const _10MB = 10*_1MB;

const startQuery = (filename, bulk) => {
  return new Promise((resolve, reject) => {
    let base64Content = bulk.toString('base64');
    let sql = "INSERT INTO files (name, content) VALUES (?, ?)";
    let inserts = [filename, base64Content];
    sql = mysqlConnection.format(sql, inserts);

    // no escape
    
    //let sql = `INSERT INTO files (name, content) VALUES (${filename}, ${base64Content})`;

    mysqlConnection.query(sql, (err, result)=>{
      if (err) { console.error(err) }
        resolve("success");
    });
  });
}

const partReadInsert = async (fileName, readStream) => {
  return new Promise((resolve, reject) => {
    let bulk = Buffer.alloc(_20MB);
    let i = 0;
    let prevChunkLength = 0;
    readStream.on('data', async (chunk)=> {
      chunk.copy(bulk, prevChunkLength, 0);
      prevChunkLength += chunk.length;
      //bulk += chunk;
      if (Buffer.byteLength(bulk, 'binary') >= _10MB) {

        await methods.startQuery(fileName, bulk);
        prevChunkLength = 0;
        bulk = new Buffer.alloc(_20MB);

          console.log(i);

        i++;
      }
      
    });
    readStream.on('end', async ()=> {
      await methods.startQuery(fileName, bulk);
      console.log(i);
      resolve(i);
    });
  });
};

const methods = {
  startQuery: startQuery,
  partReadInsert: partReadInsert
}

describe('MySQL storing files', function() {
  //this.slow(1*60*1000);
  this.timeout(3*60*60*1000);
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

  it('MySQL stores all given file(s) to table', async () => {
    console.log("## Begin test: MySQL stores all given file(s) to table");
    let timeStart = new Date().getTime();
    let counter = 0;
    
    for (let file of files) {
      let filePath = path.join(file.path, file.name);
      let thisFile = {
        name: file.name,
        readStream: fs.createReadStream(filePath),
      }

      //thisFile.readStream.pipe(thisFile.writeStream);

    await methods.partReadInsert(thisFile.name, thisFile.readStream);
    counter++;
       
    }
    // for over, so all files have been handled by mysql
    console.log(" --> " + counter + " file(s) has been inserted into MySQL");
    console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
  });

  // let startQuery = (bufferGroup, filename) => {
  //   return new Promise((resolve, reject) => {
  //     let i = 0;
  //     for (let binSeg of bufferGroup) {
  //       let base64Seg = binSeg.toString('base64');
  //       // preparing insert query
  //       let sql = "INSERT INTO files (name, content) VALUES (?, ?)";
  //       let inserts = [filename, base64Seg];
  //       sql = mysqlConnection.format(sql, inserts);
  //       mysqlConnection.query(sql, (err, result)=> {
  //         i++;
  //         if (err) { console.error(err) }
  //         if (i >= bufferGroup.length) {
  //           resolve(i);
  //         }
  //       });
  //     }
  //   });

  // };

  it.skip('MySQL inserts all file(s) under folder(s)', function(done) {
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