var fs = require('fs');
var request = require('request');
var parseString = require('xml2js').parseString;
var mkdirp = require('mkdirp');
var WaitGroup = require('waitgroup');
var ProgressBar = require('progress');
var moment = require('moment');
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
      var bar = new ProgressBar(':bar :percent :eta', { total: parseInt(end, 10) - parseInt(start, 10) });
      res.rss.channel[0].item.forEach(function(n, i) {
        // Find all mp3 files.
        if (i >= start && i < end) {
          wg.add();
          var mp3 = n.guid[0];
          // Download the mp3.
          var filename = moment(new Date(n.pubDate[0])).format('YYYY-MM-DD') + '.mp3';
          var stream = fs.createWriteStream('./mp3s/' + filename);
          stream.on('finish', function() {
            wg.done();
            bar.tick();
          });
          request(mp3).pipe(stream);
          return;
        }
      });
      wg.wait(function() {
        callback();
      });
    });
  });
};
