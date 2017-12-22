var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http = require('http');
var https = require('https');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function(err, file) {
    if (err) {
      console.error('Error on read:', exports.paths.list);
      return;
    }
    var fileList = file.split('\n');
    fileList = fileList.filter(url => url !== '');
    console.log('reading file list: ', fileList);
    callback(fileList);
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls((urlArray) => {
    callback(urlArray.includes(url));
  });
};

exports.addUrlToList = function(url, callback) {
  fs.appendFile(exports.paths.list, url + '\n', (err) => {
    if (err) {
      console.error('Error on write:', exports.paths.list);
      return;
    }
    callback();
  });
};

exports.isUrlArchived = function(url, callback) {
  fs.access(path.join(exports.paths.archivedSites, url), fs.constants.R_OK, (err) => {
    if (err) {
      console.log(url, 'not in archives.');
      callback(false);
    } else {
      callback(true);
    }
  });
};

exports.downloadUrls = function(urls) {
  // console.log('Getting urls', urls);
  urls.forEach((url) => {
    // console.log('attempting to open', path.join(exports.paths.archivedSites, url));
    fs.open(path.join(exports.paths.archivedSites, url), 'w+', (err, fd) => {
      if (err) {
        console.error('error url:', url);
        console.error('error on ', path.join(exports.paths.archivedSites, url), err);
        return;
      }
      // console.log('Getting url', url);
      // console.log('archivedSites', exports.paths.archivedSites);
      var filePath = path.join(exports.paths.archivedSites, url);

      var file = fs.createWriteStream(filePath);
      url = url.includes('http') ? url : 'http://' + url;
      console.log('Getting', url);
      var request = http.get(url, function(response) {
        // CAN ONLY HANDLE 1 REDIRECT!!
        if(response.statusCode === 301) {
          console.log('redirection to location:', response.headers.location);
          var getFunction = response.headers.location.includes('https') ? https.get : http.get;
          request = getFunction(response.headers.location, function(redirectResponse) {
            if(redirectResponse.statusCode !== 200){
              console.error('error on http GET. response code: ', redirectResponse.statusCode);
              redirectResponse.resume();
              return;
            }
            redirectResponse.pipe(file);
            console.log('contents piped to ', filePath);
            return;
          });

          response.resume();
        } else if(response.statusCode !== 200){
          console.error('error on http GET. response code: ', response.statusCode);
          response.resume();
          return;
        } else {
          response.pipe(file);
          console.log('contents piped to ', filePath);
        }
      });
      fs.close(fd, (err) => {
        // console.log('closing fd', fd);
        if (err) {
          console.error('error on file close', path.join(exports.paths.archivedSites), err);
          return;
        }
        // TODO: maybe we should remove url from sites.txt??
      });
    });
  });
};
