"use strict";

const fs = require('fs');
const path = require('path');

//read settings synclly first
const fileData = path.join(__dirname,'../data/files.json');
const files = JSON.parse(fs.readFileSync(fileData, 'utf8'));

const folderData = path.join(__dirname,'../data/folders.json');
const folders = JSON.parse(fs.readFileSync(folderData, 'utf8'));

module.exports = {
    files: files,
    folders: folders
}