var express = require('express');
var app = express();
var crypto = require('crypto');
var couchdb = require('couchdb');
var fs = require('fs');

var AccountList = require('./database/AccountList');

app.use(express.json());
app.use(express.urlencoded());

var accountList = new AccountList(5984, 'localhost');

app.get('/', function(request, response){
  response.send('Hello World');
});

// login into account
app.get('/auth/:accountID', function(request, response) {

});

// account creation
app.post('/account', function(request, response) {
	if (request.body.accountID == null)
	{
		response.send(JSON.stringify({error:"Account name not specified"}));
	}
	else
	{
		accountList.createAccount(request.body.accountID, function(result, error) {
			if (result)
			{
				response.send(JSON.stringify({result:true}));
			}
			else
			{
				response.send(JSON.stringify({error:error}));
			}
		});
	}
});

// view personal account
app.get('/account/:accountID', function(request, response) {
	// TODO authentication

	accountList.accessAccount(request.param('accountID'), function(account, error) {
		if (account)
		{
			response.send(JSON.stringify({
					balance:account.balance
				}));
			accountList.accessComplete(account, function() {});
		}
		else
		{
			response.send(JSON.stringify({'error': error}));
		}
	});
});

// returns account credentials
app.get('/verify/:accountID', function(request, response) {
  response.send('Verify account ' + request.param('accountID'));
});

// processes a certificate
app.post('/deposit', function(request, response) {
  response.send('Process transaction certificate');
});

app.listen(8080);