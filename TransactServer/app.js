var express = require('express');
var app = express();

var RestAPI = require('./RestAPI');
var Website = require('./Website');
var config = require('./config');

app.use(express.json());
app.use(express.urlencoded());

var port = 8080;
var domain = "localhost";

for (var i = 0; i < process.argv.length; ++i)
{
	var arg = process.argv[i];
	
	if (arg == "-p")
	{
		port = parseInt(process.argv[i + 1]);
		++i;
	}
	else if (arg == "-d")
	{
		domain = process.argv[i + 1];
		++i;
	}
}

var fullHostName = null;

if (port == 80)
{
	fullHostName = domain;
}
else
{
	fullHostName = domain + ':' + port;
}

RestAPI(app, fullHostName, config.smtpUser, config.smtpPassword);
Website(app, port, domain, fullHostName);

app.listen(port);