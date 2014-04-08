
var UserPublicKey = require("../certificate/UserPublicKey");

function Account(document, database)
{
	var lockCount = 0;
	var isDirty = false;
	
	this.addLock = function()
	{
		++lockCount;
	}
	
	this.removeLock = function()
	{
		return --lockCount;
	}
	
	this.__defineGetter__("lockCount", function() {
		return lockCount;
	});
	
	this.setIsDirty = function()
	{
		isDirty = true;
	}
	
	this.clearIsDirty = function()
	{
		isDirty = false;
	}
	
	this.__defineGetter__("isDirty", function() {
		return isDirty;
	});

	this.__defineGetter__("id", function() {
		return document._id;
	});
	
	this.__defineGetter__("balance", function() {
		return document.balance;
	});
	
	this.__defineGetter__("email", function() {
		return document.email;
	});
	
	this.__defineGetter__("name", function() {
		return document.name;
	});
	
	this.__defineGetter__("_document", function() {
		return document;
	});
	
	this.__defineGetter__("_database", function() {
		return database;
	});
}

Account.prototype.toString = function()
{
	return JSON.stringify(this._document);
}

Account.prototype.withdraw = function(amount)
{
	this.setIsDirty();
	this._document.balance -= amount;
}

Account.prototype.deposit = function(amount)
{
	this.setIsDirty();
	this._document.balance += amount;
}

Account.prototype.addKey = function(publicKey)
{
	this.setIsDirty();
	this._document.keys.push(publicKey.document);
}

Account.prototype.getKey = function(keyID)
{
	for (var i = 0; i < this._document.keys.length; ++i)
	{
		if (this._document.keys[i].id == keyID)
		{
			this.setIsDirty();
			return new UserPublicKey(this._document.keys[i]);
		}
	}
	
	return null;
}

Account.prototype.commitChanges = function(callback)
{
	if (this.isDirty)
	{
		this.clearIsDirty();
		this._database.saveDoc(this._document).then(
			function(){
				callback(true);
			}
		);
	}
	else
	{
		callback(true);
	}
}

Account.newAccount = function(email, name, database)
{
	var result = new Account({"email":email, "name":name, "balance":1000, "keys":[]}, database);
	result.setIsDirty();
	return result;
}

module.exports = Account;