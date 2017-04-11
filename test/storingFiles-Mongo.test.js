"use strict";

const mongoInstance = require("../mongo/connection");
const files = require("../presenter/filePresent").files;
const folders = require("../presenter/filePresent").folders;
const fs = require('fs');
const path = require('path');
const grid = require('gridfs-stream');

const walk = require('walk');

describe.skip("Mongo storing files", function() {
  //this.slow(1*60*1000);
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

        let filePath = path.join(__dirname, file.path, file.name);
        fs.createReadStream(filePath).pipe(writestream);
        i++;
      }
      writestream.on('close', function () {
          // do something with `file`
          console.log(" --> " + i + " file(s) has been written to MongoDB");
          console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
          done();
      });
  });

  it.skip('write all files under a specific folder to mongo', (done) => {
      console.log("## Begin test: write all files under a specific folder to mongo");
      let timeStart = new Date().getTime();

      let givenFiles = []; // stores files detected in the folders
      let folderCount = 0; //folder number counter
      let i = 0; //folder file counter
      
      let gfs = grid(mongoInstance.connection.db, mongoInstance.mongo);
      let walker;
      
      for (let folder of folders) {
        
        // for each folder, get the path
        let givenFolder = path.join(__dirname, folder.path, folder.name);
 
        // read the list of all files under this folder
        
        walker = walk.walk(givenFolder, { followLinks: false });
        walker.on('file', (root, stat, next) => {
            // Add this file to the list of files

            givenFiles.push({
                file: "",
                path: root,
                name: stat.name,
                sizeLvl: ""
            });
            
            next();
        });

        walker.on('end', () => {

          folderCount++;
          
          if (folderCount >= folders.length - 1) {
            // so it's the last folder. After completed "walking",  mongo does storage jobs.

            let writestream;

            // begin writing files to mongo
            for (let file of givenFiles) {
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
                  console.log(" --> " + i + " file(s) under " + folderCount + " folders has been written to MongoDB");
                  console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
                  done();
              });
            } else {
                console.warn("------------------------------------------------------------");
                console.warn("--- Warning! There's probably nothing in the given folder! ---");
                console.warn("------------------------------------------------------------");
                console.log(" --> " + i + " file(s) under " + folderCount + " folder(s) has been written to MongoDB");
                console.log(" **  This action took " + ((new Date).getTime() - timeStart) + " ms");
                done();
            }
          }
        });
      } //for

  });
});


