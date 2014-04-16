var express = require('express');
var jade = require('jade');
var crypto = require('crypto');
var http = require('http');

var PurchaseHistory = require('./database/PurchaseHistory');

function Website(app, transactPort, transactDomain, fullHostName)
{
	var purchaseHistory = new PurchaseHistory(5984, 'localhost');
	
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
		crypto.randomBytes(8, function(exception, buffer) {
			var purchaseID;

			if (exception)
				purchaseID = 0;
			else
				purchaseID = buffer.toString('hex');
			
			
			response.send(jade.renderFile('views/example.jade', {
				'title':"Smart Transact",
				'currentURL':'/example',
				'fullHostName': fullHostName,
				'purchaseID':purchaseID
				}));
		});
	});
	
	app.post('/example/deposit/:purchaseID', function(request, response) {
		purchaseHistory.hasPurchaseHappened(request.param("purchaseID"), function(alreadyRecieved) {
			if (alreadyRecieved)
			{
				response.send(JSON.stringify({"error": "Payment already recieved"}));
			}
			else
			{
				var data = JSON.stringify({cert:request.body.cert});
				
				var jsonResponse = "";
				
				var headers = {
					"Host": transactDomain,
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(data,"utf8")
					};
				
				var requestOptions = {
					hostname: transactDomain,
					port: transactPort,
					path: "/deposit",
					method: "POST",
					headers: headers
				};
				
				console.log(data);
			
				var depositRequest = http.request(requestOptions, function (depositResponse) {
					  depositResponse.on('data', function(chunk) {
						jsonResponse += chunk.toString("utf8");
					  });
					  depositResponse.on('end', function() {
						var result = JSON.parse(jsonResponse);
						
						console.log(jsonResponse);
						
						if (result.error)
						{
							response.send(JSON.stringify({"error": result.error}));
						}
						else
						{
							response.send(JSON.stringify({"result": true}));
						}
					  });
				});
				
				depositRequest.on('error', function(error) {
					console.log(error.toString());
					response.send(JSON.stringify({"error": error.toString()}));
				});
					
				depositRequest.write(data);
				
				depositRequest.end();
			}
		});
	});
	
	app.get('/example/verify/:purchaseID', function(request, response) {
		purchaseHistory.hasPurchaseHappened(request.param("purchaseID"), function(result) {
			response.send(JSON.stringify({result: result}));
		});
	});
}

module.exports = Website;