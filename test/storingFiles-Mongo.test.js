"use strict";

const mongoInstance = require("../mongo/connection");
const files = require("../presenter/filePresent").files;
const formFileList = require("../presenter/filePresent").formFileList;
//const filePromise = require("../presenter/filePresent").filePromise;
//const folders = require("../presenter/filePresent").folders;
const fs = require('fs');
const path = require('path');
const grid = require('gridfs-stream');

const walk = require('walk');

describe("Mongo storing files", function() {
  //this.slow(1*60*1000);
  this.timeout(3*60*60*1000);
  before((done) => {
    
    // runs before all tests in this block

    // drop everything in that db to continue tests
    mongoInstance.connection.once('connected', ()=>{
        console.log("猪");
    });

    mongoInstance.connection.db.dropDatabase().then(()=>{
        done();
    });

    // mongoInstance.connection
    // .on('connected', () => {
    //     console.log("after");
    //     mongoInstance.connection.db.runCommand( { dropDatabase: 1 } ).then(()=> {
    //       console.log("mongo");
    //       done();
    //     }
    //  );
    // });
    // done();
  });

  it.skip('write all given files to mongo', (done) => {
      console.log("## Begin test: write all given files to mongo");
      let timeStart = new Date().getTime();
      let gfs = grid(mongoInstance.connection.db, mongoInstance.mongo);
      // streaming to gridfs
      //filename to store in mongodb
      let i = 0; //counter
      let writestream;
      for (let file of files) {
        writestream = gfs.createWriteStream({
            filename: file.name
        });

        let filePath = path.join(file.path, file.name);
        fs.createReadStream(filePath).pipe(writestream);
        console.log("# prepared file " + i);
        i++;
      }
      console.log("# started writing. ");
      writestream.on('close', function () {
          // do something with `file`
          console.log(" --> " + i + " file(s) has been written to MongoDB");
          console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
          done();
      });
  });

  it('write all files under single(multiple) folder(s) to mongo', (done) => {
    console.log("## Begin test: write all files under single(multiple) folder(s) to mongo");
    let timeStart;
    
    formFileList.then((fileList) => {
      
      console.log(`  -- Mongo has received ${fileList.fileNum} file(s) under ${fileList.folderNum} folder(s) --`);
      timeStart = new Date().getTime();

      if (fileList.fileNum > 0) {
        // only when there is a file, that mongo go storing.
        let gfs = grid(mongoInstance.connection.db, mongoInstance.mongo);
        let writestream;
        let i = 0; //local file counter

        // begin writing files to mongo
        for (let file of fileList.files) {
            writestream = gfs.createWriteStream({
                filename: file.name
            });

            let filePath = path.join(file.path, file.name);
            fs.createReadStream(filePath).pipe(writestream);
            i++;
        }

        if (writestream !== (null||undefined)) {
            writestream.on('close', function () {
                // do something with `file`
                console.log(" --> " + i + " file(s) under " + fileList.folderNum + " folder(s) has been written to MongoDB");
                console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
                done();
            });
        } else {
            console.warn("---------------------------------------------------------------");
            console.warn("---- Warning! There's probably nothing in the given folder! ----");
            console.warn("--- Or you have encountered an error writing files to MongoDB! ---");
            console.warn("-----------------------------------------------------------------");
            console.log(" --> " + i + " file(s) under " + fileList.folderNum + " folder(s) has been written to MongoDB");
            console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
            done();
        }

      } else {
        console.warn("-------------------------------------------------------");
        console.warn("--- Warning! There is nothing in the given folder! ---");
        console.warn("-------------------------------------------------------");
        console.log(" --> " + fileList.fileNum + " file(s) under " + fileList.folderNum + " folder(s) has been written to MongoDB");
        console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms.");
        done();
      }
    }); //promise
  });// it
});


