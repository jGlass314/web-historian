// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
require('console-stamp')(console);

var archive = require('../helpers/archive-helpers.js');
var path = require('path');

exports.pullUrls = () => {
  console.log('worker pulling urls...');
  archive.readListOfUrls((urls) => {
    archive.downloadUrls(urls);
  });
};

exports.pullUrls();
