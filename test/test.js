var should = require('should');
var t = require('../downloader');
var fs = require('fs');

describe('All of the things', function() {
  // Yeah, all tests in one.
  it('Should expose the expected type', function() {
    t.should.be.instanceOf(Function);
  });
  it('Should request server like expected', function(done) {
    var http = require('http');
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      if (req.url == '/something') {
        res.end('good one');
        return;
      }
      res.end('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><rss><channel><item><guid>http://localhost:1337/something</guid></item><item></item></channel></rss>');
    }).listen(1337, '127.0.0.1');
    var opts = {
      start: 1,
      end: 1,
      url: 'http://localhost:1337',
    };
    // And just for coverage.
    t(opts);
    opts.callback = function() {
      // See if the expected file is there.
      var f = fs.readFileSync('./mp3s/0.mp3');
      f.toString().should.equal('good one');
      done();
    }
    t(opts);
  });
});
