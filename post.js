var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var exec = require('exec');
var pollIndex = 0;

var userString = 'handlekey=pollresult&id=166&formhash=809f288d&iframe=1&bgcolor=FFF&choose_value=3090';

var headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Content-Length': userString.length,
  'Connection': 'keep-alive'
};


var options = {
  host: 'bbs.lzep.cn',
  port: 80,
  path: '/xplus/poll.php?action=choose&inajax=1',
  method: 'POST',
  headers: headers
};

function sayWords(words) {
  exec(['say', words], function(err, out, code) {
    if (err instanceof Error)
      throw err;
    process.stderr.write(err);
    process.stdout.write(out);
    // process.exit(code);
  });
}

function postData() {
  var req = http.request(options, function(res) {
    res.setEncoding('binary');
    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      var str = iconv.decode(responseString, 'GBK') + '\n';
      str += 'Random Time: ' + rand/1000 + ' s\n';

      if (str.indexOf('errorhandle_pollresult') === -1) {
        pollIndex++;
        sayWords('succeed ' + pollIndex + ' times');
        str += 'Polled ' + pollIndex + ' Since ' + new Date() + '\n\n';
      }

      console.log(str);
      fs.appendFile('post.log', str);
    });
  });

  req.on('error', function(e) {
    var str = 'ERROR: ' + iconv.decode(e, 'GBK') + '\n\n';
    fs.appendFile('post.log', str);
    console.log(e);
  });

  req.write(userString);
  req.end();
}

postData();

var rand = 0;
(function loop() {
  rand = Math.round(Math.random() * 1000 * 60 * 3) + 1000 * 60;

  if (pollIndex < 200) {
    setTimeout(function() {
      postData();
      loop();
    }, rand);
  };
}());
