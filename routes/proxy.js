var express = require('express');
var request = require('request');
var router = express.Router();
var url = require('url');

/* GET users listing. */
router.get('/:url', function(req, res, next) {
	// res.send('respond with a resource' + req.params.url);
	// 当前代理的地址
	var mirrored_url = 'http://'+req.params.url ;
	var Referer = 'http://' + url.parse(mirrored_url).hostname ;
	// console.log("mirrored_url:",mirrored_url);

	var options = {
	    url: mirrored_url,
	    headers: {
	    	// 'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
			"Referer": Referer,
			// 'Accept-Encoding': "gzip, deflate, sdch",
			'Accept-Language': "zh-CN,zh;q=0.8",
			"Cookie": "pgv_pvi=1423449088; pgv_si=s7803187200; JSESSIONID=a77e80749e3f4800966b309cddf8bdc1",
	        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12A365 MicroMessenger/5.4.1 NetType/WIFI'
	    }
	};

	request(options, function (error, response, body) {
		console.log("body:",body);
		if (!error && response.statusCode == 200) {
			body = require('./nb.js').TransformContent(mirrored_url,body);
			res.end(body);
			}
		});

});



module.exports = router;
