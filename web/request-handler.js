var path = require('path');
var archive = require('../helpers/archive-helpers');
var helpers = require('./http-helpers.js');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  console.log('handleRequest type:', req.method, 'for url', req.url);
  // res.end(archive.paths.list);
  switch (req.method) {
  case 'GET':
    var fileName;
    if (req.url === '/' || '') {
      console.log('send index.html');
      fileName = path.join(__dirname, 'public/index.html');
    } else {
      fileName = path.join(archive.paths.archivedSites, req.url);
    }
    helpers.serveAssets(res, fileName, 200, assetHandler);
    break;
  case 'OPTIONS':
    optionsHandler(res, helpers.headers, 200);
    break;
  case 'POST':
    postHandler(req, res, helpers.headers, 201);
    break;
  default:
    console.error('invalid request method:', req.method);
  }
};

optionsHandler = (res, headers, statusCode) => {
  res.writeHead(statusCode, headers);
  res.end();
};

assetHandler = (res, headers, statusCode, ...args) => {
  res.writeHead(statusCode, headers);
  if (args.length === 2) {
    res.write(args[0], args[1]);
  }
  res.end();
};

postHandler = (req, res, headers, statusCode) => {
  let body = [];
  req.on('error', (err) => {
    console.error(err);
  });
  req.on('data', (chunk) => {
    body.push(Buffer(chunk));
  });
  req.on('end', () => {
    body = Buffer.concat(body).toString();
    console.log('post body:', body);
    var url = body.split('=')[1];
    archive.isUrlInList(url, (exists) => {
      if (exists) {
        console.log('asset:', url, 'exists in', archive.paths.list);
        archive.isUrlArchived(url, (isArchived) => {
          if (isArchived) {
            console.log('asset:', url, 'is archived');
            // TODO: should we return the file here?? probably...
            var filePath = path.join(archive.paths.archivedSites, url);
            console.log('serving up asset', filePath);
            helpers.serveAssets(res, filePath, 201, assetHandler);
          } else {
            console.log("not archived, send loading page");
            helpers.serveAssets(res, path.join(__dirname, 'public/loading.html'), 302, assetHandler);
          }
        });
      } else {
        archive.addUrlToList(url, () => {
          console.log('added', url, 'to', archive.paths.list, 'sending load page');
          helpers.serveAssets(res, path.join(__dirname, 'public/loading.html'), 302, assetHandler);
          // res.writeHead(302, headers);
          // res.end();
        });
      }
    });
    //
    // headers['Content-Type'] = 'application/json';
    // var results = JSON.stringify(messages);
    // response.writeHead(statusCode, headers);
    // response.end(results);

  });
};
