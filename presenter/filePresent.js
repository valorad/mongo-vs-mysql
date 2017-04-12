"use strict";

const fs = require('fs');
const path = require('path');

const walk = require('walk');

//read settings synclly first
const fileData = path.join(__dirname,'../data/files.json');
const files = JSON.parse(fs.readFileSync(fileData, 'utf8'));

const folderData = path.join(__dirname,'../data/folders.json');
const folders = JSON.parse(fs.readFileSync(folderData, 'utf8'));

function formFileList(folders) {
  console.log(" -- Walker is scanning files --");
  return new Promise((resolve, reject) => {

    for (let folder of folders) {
      // read the list of all files under this folder
      
      let givenFiles = []; // stores files detected in the folders
      let givenFolder = path.join(__dirname, folder.path, folder.name);
      let folderCount = 0; //folder number counter
      let fileCount = 0; // counts file number

      let walker = walk.walk(givenFolder, { followLinks: false });

      walker.on('file', (root, stat, next) => {
        // Add this file to the list of files
        givenFiles.push({
            file: "",
            path: root,
            name: stat.name,
            sizeLvl: ""
        });

        fileCount++;
        
        next();
        //console.log("FP: file");
      });

      
      walker.on('end', () => {
        folderCount++;
        //console.log("FP: end");
        if (folderCount >= folders.length) {
          // so it's the last folder. After scanning this, return results.
          //console.log("FP: returned");
          resolve({
            files: givenFiles,
            folderNum: folderCount,
            fileNum: fileCount
          }); 
        }
      });
    }
  });
}

module.exports = {
  files: files,
  folders: folders,
  formFileList: formFileList(folders)
}