var express = require('express');
var app = express();
var crypto = require('crypto');
var couchdb = require('couchdb');
var fs = require('fs');
var ursa = require('ursa');

var AccountList = require('./database/AccountList');

app.use(express.json());
app.use(express.urlencoded());

var accountList = new AccountList(5984, 'localhost');

app.get('/', function(request, response){
	var keypair = ursa.generatePrivateKey(2048, 65537);
	
	var result = "";
	
	for (var key in keypair)
	{
		result += key + ', ';
	}
	
	result += "<br />";
	
	var publicPem = keypair.toPublicPem("base64");
	var privatePem = keypair.toPrivatePem("base64");
	
	result += "Public Key: " + publicPem + "<br />";
	result += "Private Key: " + privatePem + "<br />";
	
	var publicRecreate = ursa.createPublicKey(publicPem, "base64");
	var privateRecreate = ursa.createPrivateKey(privatePem, "", "base64");
	
	var encrypted = privateRecreate.privateEncrypt("Hello World", "utf8", "base64");
	
	result += "Encrypted: " + encrypted + "<br />";
	
	var decrypted = publicRecreate.publicDecrypt(encrypted, "base64", "utf8");
	
	result += "Decrypted: " + decrypted + "<br />";
	
	response.send(result);
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