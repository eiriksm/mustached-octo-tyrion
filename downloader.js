'use strict';
var fs = require('fs');
var request = require('request');
var parseString = require('xml2js').parseString;
var mkdirp = require('mkdirp');
var ProgressBar = require('progress');
var moment = require('moment');
var async = require('async');

function createItemFuncs(arr, bar) {
  return arr.map(function(n) {
    return function(callback) {
      async.waterfall([
        checkSummary.bind(this, n),
        download
      ], function(err) {
        bar.tick();
        callback(err);
      });
    };
  });
}

function logger() {
  console.log.apply(console, arguments);
}

function checkSummary(item, callback) {
  console.log(item)
  var summary = item['itunes:summary'][0];
  if (summary.indexOf('Best of') > -1 || summary.indexOf('Destillert') > -1) {
    logger('Skipping %s because it seems to be a summary episode', summary);
    return callback(null, item, true);
  }
  return callback(null, item, false);
}

function download(item, isSummary, callback) {
  var filename = moment(new Date(item.pubDate[0])).format('YYYY-MM-DD') + '.mp3';
  console.log(filename)
  if (isSummary) {
    return callback();
  }
  var summary = item['itunes:summary'][0];
  logger('Starting download of %s', summary);
  var mp3 = item.guid[0];
  // Download the mp3.
  var filename = moment(new Date(item.pubDate[0])).format('YYYY-MM-DD') + '.mp3';
  var stream = fs.createWriteStream('./mp3s/' + filename);
  stream.on('finish', function() {
    callback();
  });
  request(mp3).pipe(stream);
}

module.exports = function(opts) {
  var callback = opts.callback;
  if (!callback) {
    // Noop.
    callback = function() {};
  }
  var start = parseInt(opts.start, 10) - 1;
  var end = parseInt(opts.end, 10);
  var bar = new ProgressBar(':bar :percent :eta', { total: parseInt(end, 10) - parseInt(start, 10) });
  mkdirp.sync('./mp3s');
  // Request rss feed.
  request(opts.url, function(e, r, b) {
    // Convert away from ugly xml.
    parseString(b, function(er, res) {
      // Reduce to the ones we want.
      var dls = res.rss.channel[0].item.filter(function(n, i) {
        return i >= start && i < end;
      });
      var funcs = createItemFuncs(dls, bar);
      async.parallel(funcs, callback);
    });
  });
};
