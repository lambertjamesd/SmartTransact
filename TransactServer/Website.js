var express = require('express');
var jade = require('jade');

function Website(app)
{
	app.use(express.static(process.cwd() + '/public'));

	app.get('/', function(request, response) {
		response.send(jade.renderFile('views/index.jade', {
			'title':"Smart Transact",
			'currentURL':'/'
			}));
	});
	
	app.get('/download', function(request, response) {
		response.send(jade.renderFile('views/download.jade', {
			'title':"Smart Transact",
			'currentURL':'/download'
			}));
	});
	
	app.get('/example', function(request, response) {
		response.send(jade.renderFile('views/example.jade', {
			'title':"Smart Transact",
			'currentURL':'/example'
			}));
	});
	
	app.post('/example/deposit', function(request, response) {
		response.send('{}');
	});
}

module.exports = Website;