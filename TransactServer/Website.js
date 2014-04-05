var express = require('express');
var jade = require('jade');

function Website(app)
{
	app.use(express.static(process.cwd() + '/public'));

	app.get('/', function(request, response) {
		response.send(jade.renderFile('views/index.jade', {'title':"Smart Transact"}));
	});
}

module.exports = Website;