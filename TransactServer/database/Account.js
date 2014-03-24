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
	
	this.__defineGetter__("isDirty", function() {
		return isDirty;
	});

	this.__defineGetter__("id", function() {
		return document._id;
	});
	
	this.__defineGetter__("balance", function() {
		return document.balance;
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

Account.prototype.commitChanges = function(callback)
{
	if (this.isDirty)
	{
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

Account.transfer = function(source, destination, amount, callback)
{
	source.withdraw(amount);
	destination.deposit(amount);
}

Account.newAccount = function(accountName, database)
{
	var result = new Account({"_id":accountName, "balance":1000}, database);
	result.setIsDirty();
	return result;
}

module.exports = Account;