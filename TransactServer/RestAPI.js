
var crypto = require('crypto');
var couchdb = require('couchdb');
var fs = require('fs');
var ursa = require('ursa');
var nodemailer = require("nodemailer");
var jade = require("jade");

var AccountList = require('./database/AccountList');
var TransactionHistory = require('./database/TransactionHistory');
var DepositCertificate = require('./certificate/DepositCertificate');
var UserPublicKey = require("./certificate/UserPublicKey");
	
function RestAPI(app, fullHostName)
{
	var accountList = new AccountList(5984, 'localhost');
	var transactionHistory = new TransactionHistory(5984, 'localhost');

	var smtpTransport = nodemailer.createTransport("SMTP",{
		service: "Gmail",
		auth: {
			user: "smart.transact.360@gmail.com",
			pass: "cs360final"
		}
	});

	var serverPrivateKey = null;

	fs.readFile('ServerPrivateKey.pem', 'utf8', function (err,data) {
		if (err)
		{
			console.log(err);
		}
		else
		{	
			try
			{
				serverPrivateKey = ursa.createPrivateKey(data, "", "utf8");
			}
			catch (error)
			{
				console.log("Error loading ServerPrivateKey.pem : " + error.toString());
			}
		}
	});
	
	function sendVerificationEmail(account, key)
	{
		var activationUrl = "http://" + fullHostName + "/activate/" + key.id + "?token=" + key.activationToken;

		var mailOptions = {
			from: "Smart Tranasct <smart.transact.360@gmail.com>", // sender address
			to: account.name + " <" + account.email + ">", // list of receivers
			subject: "Finish login", // Subject line
			text: "Click the link to activate your keypair \n" + activationUrl, // plaintext body
			html: "Click the link to activate your keypair \n<a href=\"" + activationUrl + "\">" + activationUrl + "</a>" // html body
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);
			}else{
				console.log("Message sent: " + response.message);
			}
		});
	}

	app.get('/testing', function(request, response){
		var keypair = ursa.generatePrivateKey(2048, 65537);
		var result = "";
		
		
		for (var key in keypair)
		{
			result += key + ', ';
		}
		
		result += "<br />";
		
		var publicPem = keypair.toPublicPem("utf8");
		var privatePem = keypair.toPrivatePem("utf8");
		
		result += "Public Key: " + publicPem + "<br />";
		result += "Private Key: " + privatePem + "<br />";
		
		var publicRecreate = ursa.createPublicKey(publicPem, "utf8");
		var privateRecreate = ursa.createPrivateKey(privatePem, "", "utf8");
		
		var encrypted = privateRecreate.privateEncrypt("Hello World", "utf8", "base64");
		
		result += "Encrypted: " + encrypted + "<br />";
		
		var decrypted = publicRecreate.publicDecrypt(encrypted, "base64", "utf8");
		
		result += "Decrypted: " + decrypted + "<br />";
		
		result += "Ciphers: " + crypto.getCiphers() + "<br />";
		
		response.send(result);
	});


	app.get('/resendToken/:keyID', function(request, response) {
		accountList.accountWithKeypairID(request.param('keyID'), function(accountName, key)
		{
			if (accountName)
			{
				accountList.accessAccount(accountName, function(account, error) {
					if (account)
					{
						var key = account.getKey(request.param('keyID'));
						
						if (key.status != "inactive")
						{
							response.send(JSON.stringify({'error': "Key does not need activation"}));
						}
						else
						{
							sendVerificationEmail(account, key);
							response.send(JSON.stringify({'result': true}));
						}
							
						accountList.accessComplete(account, function() {});
					}
					else
					{
						response.send(JSON.stringify({'error': error.toString()}));
					}
				});
			}
			else
			{
				response.send(JSON.stringify({'error': "Invalid key id"}));
			}
		});
	});
	
	function activateKey(request, response, callback)
	{
		accountList.accountWithKeypairID(request.param('keyID'), function(accountName, key)
		{
			if (accountName)
			{
				accountList.accessAccount(accountName, function(account, error) {
					if (account)
					{
						var key = account.getKey(request.param('keyID'));
						
						if (key.status != "inactive")
						{
							callback(false, "Key does not need activation");
						}
						else if (key.activationToken != request.param('token'))
						{
							callback(false, "Invalid activation token");
						}
						else
						{
							key.status = "active";
							key.deleteActivationToken();
							callback(true, "Activation successful");
						}
							
						accountList.accessComplete(account, function() {});
					}
					else
					{
						callback(false, error.toString());
					}
				});
			}
			else
			{
				callback(false, "Invalid key id");
			}
		});
	}

	// used in two step verification to authenticate key
	app.get('/activate/:keyID', function(request, response) {
		activateKey(request, response, function(result, message) {
			response.send(jade.renderFile('views/activation.jade', {'title':"Smart Transact", "message":message}));
		});
	});

	// add new key to account
	app.post('/account/key', function(request, response) {
		var publicKeyString = request.body.publicKey;
		var email = request.body.email;
		
		if (typeof(email) != "string")
		{
			response.send(JSON.stringify({error:"No email specified"}));
		}
		else if (typeof(publicKeyString) != "string")
		{
			response.send(JSON.stringify({error:"No public key specified"}));
		}
		else if (!UserPublicKey.verifyPublicKey(publicKeyString))
		{
			response.send(JSON.stringify({error:"Invalid public key"}));
		}
		else
		{
			accountList.accessAccountUsingEmail(request.body.email, function(account, error) {
				if (account)
				{		
					var publicKey = UserPublicKey.createNew(request.body.publicKey);
					account.addKey(publicKey);
					accountList.accessComplete(account, function() {});
					
					sendVerificationEmail(account, publicKey);
					
					response.send(JSON.stringify({'result': true, "keyID":publicKey.id, accountID:account.id}));
				}
				else
				{
					response.send(JSON.stringify({'error': error}));
				}
			});
		}
	});

	// account creation
	app.post('/account', function(request, response) {

		var publicKeyString = request.body.publicKey;
		var name = request.body.name;
		var email = request.body.email;
		
		if (typeof(name) != "string")
		{
			response.send(JSON.stringify({error:"No account name specified"}));
		}
		else if (typeof(email) != "string")
		{
			response.send(JSON.stringify({error:"No email specified"}));
		}
		else if (typeof(publicKeyString) != "string")
		{
			response.send(JSON.stringify({error:"No public key specified"}));
		}
		else if (!UserPublicKey.verifyPublicKey(publicKeyString))
		{
			response.send(JSON.stringify({error:"Invalid public key"}));
		}
		else
		{
			var publicKey = UserPublicKey.createNew(publicKeyString);

			accountList.createAccount(request.body.email, request.body.name, publicKey, function(account, error) {
				if (account)
				{
					sendVerificationEmail(account, publicKey);
					response.send(JSON.stringify({result:true, keyID:publicKey.id, accountID:account.id}));
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
		accountList.accessAccount(request.param('accountID'), function(account, error) {
			if (account)
			{
				var publicKey = account.getKey(request.param('key'));
				
				if (publicKey == null)
				{
					response.send(JSON.stringify({'error': "Invalid key id"}));
				}
				else if (publicKey.status == "inactive")
				{
					response.send(JSON.stringify({'error': "Key is not active"}));
				}
				else
				{
					publicKey.status = "active";
					
					var data = JSON.stringify({
							name:account.name,
							email:account.email,
							balance:account.balance,
							id:account.id
						});
						
					crypto.randomBytes(32, function(exception, keyData) {
						if (exception)
						{
							response.send(JSON.stringify({'error': exception.toString()}));
						}
						else
						{
							var aesKey = keyData.slice(0, 16);
							var iv = keyData.slice(16, 32);
							
							var cipher = crypto.createCipheriv("aes-128-cbc", aesKey, iv);
							var encryptedData = cipher.update(data, "utf8", "base64") + cipher.final("base64");
							
							var encryptedKey = publicKey.encrypt(keyData.toString('base64'), 'base64', 'base64');
							
							response.send(JSON.stringify({'data': encryptedData, 'key':encryptedKey}));
						}
					});
						
				}
					
				accountList.accessComplete(account, function() {});
			}
			else
			{
				response.send(JSON.stringify({'error': error.toString()}));
			}
		});
	});

	// returns account credentials
	app.get('/verify/:accountID', function(request, response) {
		accountList.accessAccount(request.param('accountID'), function(account, error) {
			if (account)
			{
				var info = JSON.stringify({name:account.name, id:account.id});
				accountList.accessComplete(account, function() {});
				
				var signer = ursa.createSigner("sha256");
				signer.update(info, "utf8");
				var signature = signer.sign(serverPrivateKey, "base64");
				
				response.send(JSON.stringify({'info': info, 'signature':signature}));
			}
			else
			{
				response.send(JSON.stringify({'error': error}));
			}
		});
	});

	// callback prototype - function(certificate, sourceName, [error])
	// is is a string if certificate and sourceName are null
	function verifyCertificate(certificateText, callback)
	{
		if (certificateText == null)
		{
			callback(null, null, 'No certificate specified');
		}

		var depositCertificate = null;
		try
		{
			depositCertificate = DepositCertificate.parse(certificateText);
		}
		catch (error)
		{
			callback(null, null, error.toString());
			return;
		}
		
		transactionHistory.hasDepositHappened(depositCertificate, function(result) {
			if (result)
			{
				callback(null, null, "Certificate has already been used");
			}
			else
			{
				accountList.accountWithKeypairID(depositCertificate.keypairID, function(accountName, key)
				{
					if (accountName)
					{
						if (key.status != "active")
						{
							callback(null, null, "Invalid key");
						}
						else if (!key.verify(depositCertificate.digestInput, depositCertificate.signature))
						{
							callback(null, null, "Invalid Signature");
						}
						else
						{
							callback(depositCertificate, accountName);
						}
					}
					else
					{
						callback(null, null, "No key found");
					}
				});
			
			}
		});
	}

	// determines if a certificate is usable 
	app.post('/deposit/verify', function(request, response) {
		verifyCertificate(request.body.cert, function(certificate, sourceAccountName, error) {
			if (error)
			{
				response.send(JSON.stringify({'error': error}));
			}
			else
			{
				response.send(JSON.stringify({'result': true}));
			}
		});
	});

	// processes a certificate
	app.post('/deposit', function(request, response) {
		verifyCertificate(request.body.cert, function(depositCertificate, sourceAccountName, error) {
			if (error)
			{
				response.send(JSON.stringify({'error': error}));
			}
			else
			{
				accountList.transfer(sourceAccountName, depositCertificate.recepientID, depositCertificate.amount, function(result, error) {
					if (result)
					{
						transactionHistory.logDeposit(depositCertificate, sourceAccountName, function() {
							response.send(JSON.stringify({'result':true}));
						});
					}
					else
					{
						response.send(JSON.stringify({'error': error.toString()}));
					}
				});
			}
		});
	});
}

module.exports = RestAPI;