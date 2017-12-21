var fs = require('fs');
var path = require('path');
var _ = require('underscore');

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
    callback(file.split('\n'));
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
  urls.forEach((url) => {
    fs.open(path.join(exports.paths.archivedSites, url), 'w+', (err, fd) => {
      if (err) {
        console.error('error on write to', path.join(exports.paths.archivedSites, url), err);
        return;
      }
      fs.close(fd, (err) => {
        if (err) {
          console.error('error on file close', path.join(exports.paths.archivedSites), err);
        }
        // TODO: maybe we should remove url from sites.txt??
      });
    });
  });
};
