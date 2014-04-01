var express = require('express');
var app = express();
var crypto = require('crypto');
var couchdb = require('couchdb');
var fs = require('fs');
var ursa = require('ursa');
var nodemailer = require("nodemailer");

var AccountList = require('./database/AccountList');
var TransactionHistory = require('./database/TransactionHistory');
var DepositCertificate = require('./certificate/DepositCertificate');
var UserPublicKey = require("./certificate/UserPublicKey");

app.use(express.json());
app.use(express.urlencoded());

var accountList = new AccountList(5984, 'localhost');
var transactionHistory = new TransactionHistory(5984, 'localhost');

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "smart.transact.360@gmail.com",
        pass: "cs360final"
    }
});

var port = 8080;
var domain = "localhost:" + port;

function sendVerificationEmail(account, key)
{
	var activationUrl = "http://" + domain + "/activate/" + key.id + "?token=" + key.activationToken;

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

app.get('/', function(request, response){
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
	
	response.send(result);
});

// used in two step verification to authenticate key
app.get('/activate/:keyID', function(request, response) {
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
					else if (key.activationToken != request.param('token'))
					{
						response.send(JSON.stringify({'error': "Invalid activation token"}));
					}
					else
					{
						key.status = "active";
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
	// TODO authentication
	accountList.accessAccount(request.param('accountID'), function(account, error) {
		if (account)
		{
			response.send(JSON.stringify({
					name:account.name,
					email:account.email,
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
	accountList.accessAccount(request.param('accountID'), function(account, error) {
		if (account)
		{
			var info = JSON.stringify({name:account.name});
			accountList.accessComplete(account, function() {});
		}
		else
		{
			response.send(JSON.stringify({'error': error}));
		}
	});
});

// processes a certificate
app.post('/deposit', function(request, response) {
	
	if (request.body.cert == null)
	{
		response.send(JSON.stringify({'error': 'No certificate specified'}));
	}

	var depositCertificate = null;
	try
	{
		depositCertificate = DepositCertificate.parse(request.body.cert);
	}
	catch (error)
	{
		response.send(JSON.stringify({'error': error.toString()}));
		return;
	}
	
	transactionHistory.hasDepositHappened(depositCertificate, function(result) {
		if (result)
		{
			response.send(JSON.stringify({'error': "Certificate has already been used"}));
		}
		else
		{
			accountList.accountWithKeypairID(depositCertificate.keypairID, function(accountName, key)
			{
				if (accountName)
				{
					if (key.status != "active")
					{
						response.send(JSON.stringify({'error': "Invalid key"}));
					}
					else if (!key.verify(depositCertificate.digestInput, depositCertificate.signature))
					{
						response.send(JSON.stringify({'error': "Invalid Signature"}));
					}
					else
					{
						accountList.transfer(accountName, depositCertificate.recepientID, depositCertificate.amount, function(result, error) {
							if (result)
							{
								transactionHistory.logDeposit(depositCertificate, accountName, function() {
									response.send(JSON.stringify({'result':true}));
								});
							}
							else
							{
								response.send(JSON.stringify({'error': error.toString()}));
							}
						});
					}
				}
				else
				{
					response.send(JSON.stringify({'error': "No key found"}));
				}
			});
		
		}
	});
});

app.get('/purchase', function(request, response){	
	var privateKeyPem = 
		"-----BEGIN RSA PRIVATE KEY----- \n" + 
		"MIIEpAIBAAKCAQEAs30a07RnYPjpCsOJxicJwMehN5q9LvTlT5mop3lJHlYlPO49\n" + 
		"o8cp98PgZTWmRxCfXQoTGFadOTZchjtTy8mSE4X01q9RKCXITZqJ9TZUiUl2j3Ug\n" + 
		"TestU26ku3Z+vcoSDulemU0fBhXROHr6drBNhvgcOwiet52Ec9BvbT1aSFDf8zy4\n" + 
		"qeeQuxS76K8KwF1rRU4qWTWh34gsYP6qNI9OZqSxxGyHOJ3z/sIi0aT7P7SpXwzD\n" + 
		"K7XEpJPUZApKv54Jvb5Irt5Te4sxX2YbPt4+OgkW0EqSZRhhiTx0/vkMWRy/FjPp\n" + 
		"c8f56NrzwLITfEJTJCCKCCRF27mwjselBBdmrwIDAQABAoIBADyElRQGgsjGhETV\n" + 
		"01FVfktaw/fsm5cGiX7CT4RQN6Ab6ahWp7/d+j+I8tMNOMhDSYhkSjXtlkthEedM\n" + 
		"f595kmA0zW3JZPLFcnj//z4HmI9Fjs0l78N15S15Y9+1P1yckmQmuXe08h3qI0YI\n" + 
		"6QQ1w54bb+FTsbg1SyCFidxqUFOLKIK9ybQ1gpIxRmFrrARcyYv/bbHWEAFHbk4G\n" + 
		"3vGQfR6FqOW4Vo2WSC/3ynTpb/P9wu2gCsmUGZLrjeWfpUZUtlRN0IDBrerihIgl\n" + 
		"HiW6MZZ54MiORaljLwp6sh6V2eaV4YR0MOGS7BQ4eDapGk5ON0rkjGgyYviN9mFo\n" + 
		"3Yp2ikECgYEA4m26TcS7QLlycgvdydPUlhs/5+W3pyclLX1GcraKlr/ljlzlOQpt\n" + 
		"G/xEhApyI+XefzqYhBZJUgsR1dcdbs0uw6uotdevJx2AO4lIP08vHRL7GtFxoid3\n" + 
		"CSsmwVynDa8LQw0wqmWlOOQ/3EeTd4Jn08GCEMr6VnZB+VDmIC9oxI8CgYEAyu4E\n" + 
		"Tnz2A81FLru9pW/+tsdQiuQOuk1YYHSaZYbyF4fxpTCfhu0PbECKrvpQaI5PRDpc\n" + 
		"uThaxEmIeP5H67ESFewJWnW/+0YjKDmFvbBa4K8tIllunibASNXnHzY07uo0+wpw\n" + 
		"6KG5E7lCp/yHG+JmGtvEp7vOD9jwXZ0Y93Oni+ECgYB4CUGl7rByTJ2eVioaz+C4\n" + 
		"PvPvBPoKdBcieXI6aAkqh8qzYQ3n4l4bYu4TrdH6s+bzPeYSyBnQk6u92I9y6PVs\n" + 
		"p/kFhbUGIH6VkV6qqVjJqgFSo0wBcbiKNMUT5wFsoKpwvnJZMw+XDHHKXmuQBKL0\n" + 
		"QHaqXmC+K20oNbn5wAhjgwKBgQCKqRqeOvqrXF6ycSxD2AP3Brg9P1nk6SbDOcmq\n" + 
		"KAxSEd0HH/NRcbiBIpTgvT+mQd9d4ncrRJuY1hn/etjP7r1J52/4tM7KtoEdYjjF\n" + 
		"hbSDJI+1keBpBleLLUXw6MxAmB49j0PZYXAiTwuB16bGYeuc3KBCcKx73aNYhBjk\n" + 
		"NM2+YQKBgQCjQrpQ654OSFSzoKT8VRs76trc8rQAQBAo0nkgKTmV+UAqPUWfQysG\n" + 
		"VAF5ZtvrjYRiRqrdds308Ows+Dp6odX6F8a6Adm/zLXvb+Fzy14ZFcCw7Xias0Qr\n" + 
		"/4VqzcGOhV2eAGGR1NzcBbeap5hYG7X2/UPuCd3DK1Zx/ntpyGmZ6Q==\n" + 
		"-----END RSA PRIVATE KEY-----";

	var data = "ben,0,10,4";
	
	var privateKey = ursa.createPrivateKey(privateKeyPem, "", "utf8");
	var signer = ursa.createSigner("sha256");
	signer.update(data, "utf8");
	var signature = signer.sign(privateKey, "base64");
	
	var publicKeyPem  = 
		"-----BEGIN PUBLIC KEY----- \n" +
		"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs30a07RnYPjpCsOJxicJ\n" +
		"wMehN5q9LvTlT5mop3lJHlYlPO49o8cp98PgZTWmRxCfXQoTGFadOTZchjtTy8mS\n" +
		"E4X01q9RKCXITZqJ9TZUiUl2j3UgTestU26ku3Z+vcoSDulemU0fBhXROHr6drBN\n" +
		"hvgcOwiet52Ec9BvbT1aSFDf8zy4qeeQuxS76K8KwF1rRU4qWTWh34gsYP6qNI9O\n" +
		"ZqSxxGyHOJ3z/sIi0aT7P7SpXwzDK7XEpJPUZApKv54Jvb5Irt5Te4sxX2YbPt4+\n" +
		"OgkW0EqSZRhhiTx0/vkMWRy/FjPpc8f56NrzwLITfEJTJCCKCCRF27mwjselBBdm\n" +
		"rwIDAQAB\n" +
		"-----END PUBLIC KEY----- ";
		
	var publicKey = ursa.createPublicKey(publicKeyPem, "utf8");
	
	var verifier = ursa.createVerifier("sha256");
	verifier.update(data, "utf8");
	var looksGood = verifier.verify(publicKey, signature, "base64");
	
	var hash = crypto.createHash("sha256");
	hash.update(data, "utf8");
	var digest = hash.digest('base64');
	
	var mySignature = privateKey.privateEncrypt(digest, "base64", "base64");
	
	var digestDecrypt = publicKey.publicDecrypt(mySignature, "base64", "base64");
	
	response.send(signature + "<br />" + digest + "<br />" + mySignature + "<br />" + digestDecrypt + "<br />" + looksGood.toString());
});

app.listen(port);