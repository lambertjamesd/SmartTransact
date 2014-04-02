
var ursa = require("ursa");
var crypto = require("crypto");

function UserPublicKey(document)
{
	var encryptionKey = null;

	if (document.publicKey == null)
	{
		throw new Error("No public key specified");
	}
	
	if (document.id == null)
	{
		throw new Error("No key id specified");
	}
	
	if (document.status == null)
	{
		throw new Error("No status specified");
	}
	
	this.__defineGetter__("id", function() {
		return document.id;
	});
	
	this.__defineGetter__("encryptionKey", function() {
		if (encryptionKey == null)
		{
			encryptionKey = ursa.createPublicKey(this.publicKey, "utf8");
		}
		
		return encryptionKey;
	});
	
	this.__defineGetter__("publicKey", function() {
		return document.publicKey;
	});
	
	this.__defineGetter__("status", function() {
		return document.status;
	});
	
	this.__defineSetter__("status", function(value) {
		document.status = value;
	});
	
	this.__defineGetter__("activationToken", function() {
		return document.activationToken;
	});
	
	this.__defineGetter__("document", function() {
		return document;
	});
}

UserPublicKey.prototype.verify = function(data, signature)
{
	try
	{	
		var publicKey = this.encryptionKey;
		
		var verifier = ursa.createVerifier("sha256");
		verifier.update(data, "utf8");
		return verifier.verify(publicKey, signature, "base64");
	}
	catch (error)
	{
		console.log(error.toString());
		return false;
	}
}

UserPublicKey.createNew = function(publicKey)
{
	var keyID = crypto.randomBytes(12).toString('hex');	
	var activationToken = crypto.randomBytes(6).toString('hex');
	
	return new UserPublicKey({publicKey: publicKey, id: keyID, status:"inactive", activationToken:activationToken});
}

UserPublicKey.verifyPublicKey = function(publicKey)
{
	try
	{
		var publicKey = ursa.createPublicKey(publicKey, "utf8");
		return publicKey != null;
	}
	catch (exception)
	{
		return false;
	}
}

UserPublicKey.prototype.encrypt = function(data, inputEncoding, outputEncoding)
{
	return this.encryptionKey.encrypt(data, inputEncoding, outputEncoding);
}

module.exports = UserPublicKey;