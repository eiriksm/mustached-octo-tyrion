var start = process.argv[2] || 1;
var end = process.argv[3] || 10;
var url = 'http://www.p4.no/lyttesenter/podcast.ashx?pid=330';

var opts = {
  url: url,
  start: start,
  end: end
};

require('./downloader')(opts);
