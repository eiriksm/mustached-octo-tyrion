var fs = require('fs');
var request = require('request');
var parseString = require('xml2js').parseString;
var mkdirp = require('mkdirp');
var WaitGroup = require('waitgroup');

module.exports = function(opts) {
  var callback = opts.callback;
  if (!callback) {
    // Noop.
    callback = function() {};
  }
  var start = parseInt(opts.start, 10) - 1;
  var end = parseInt(opts.end, 10);
  mkdirp.sync('./mp3s');
  // Request rss feed.
  request(opts.url, function(e, r, b) {
    // Convert away from ugly xml.
    parseString(b, function(er, res) {
      var wg = new WaitGroup();
      res.rss.channel[0].item.forEach(function(n, i) {
        wg.add();
        // Find all mp3 files.
        if (i >= start && i < end) {
          var mp3 = n.guid[0];
          // Download the mp3.
          var stream = fs.createWriteStream('./mp3s/' + i + '.mp3');
          stream.on('finish', function() {
            wg.done();
          });
          request(mp3).pipe(stream);
          return;
        }
        wg.done();
      });
      wg.wait(function() {
        callback();
      });
    });
  });
}

