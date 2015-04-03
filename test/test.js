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
      res.end('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><rss><channel><item><guid>http://localhost:1337/something</guid><pubDate>Thu, 02 Apr 2035 13:30:46 GMT</pubDate></item><item></item></channel></rss>');
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
      var filename = './mp3s/2035-04-02.mp3';
      var f = fs.readFileSync(filename);
      f.toString().should.equal('good one');
      fs.unlinkSync(filename);
      done();
    }
    t(opts);
  });
});
