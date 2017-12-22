var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS, POST',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};

// var validExtensions = {
//   '.html': 'text/html',
//   '.js': 'application/javascript',
//   '.css': 'text/css',
//   '.txt': 'text/plain',
//   '.jpg': 'image/jpeg',
//   '.gif': 'image/gif',
//   '.png': 'image/png',
//   '.woff': 'application/font-woff',
//   '.woff2': 'application/font-woff2'
// };

exports.serveAssets = function(res, asset, statusCode, callback) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...),
  // css, or anything that doesn't change often.)
  console.log('static page request for asset:', asset);
  // var ext = path.extname(asset);
  // var mimeType = validExtensions[ext];
  // var validMimeType = validExtensions[ext] !== undefined;
  // console.log('mimeType:', mimeType);

  // check to make sure file exists and can be read from
  fs.access(asset, fs.constants.R_OK, (err) => {
    if (err) {
      console.error('no access!');
      callback(res, exports.headers, 404);
      return;
    }
    // if (!validMimeType) {
    //   console.log('Invalid file extension detected: ' + ext + ' (' + asset + ')');
    //   exports.headers['Content-Type'] = 'text/plain';
    //   callback(res, exports.headers, 500);
    //   return;
    // }
    fs.readFile(asset, 'binary', function(err, file) {
      if (err) {
        // exports.headers['Content-Type'] = 'text/plain';
        callback(res, exports.headers, 500);
        return;
      }
      // exports.headers['Content-Type'] = mimeType;
      callback(res, exports.headers, statusCode, file, 'binary');
    });
  });
};



// As you progress, keep thinking about what helper functions you can put here!
