
var couchdb = require('couchdb');
var Account = require('./Account');

function AccountList(serverPort, serverHost)
{
	var client = couchdb.createClient(serverPort, serverHost);
	var database = client.db('accounts');
	
	var lockedAccounts = {};
	
	this.__defineGetter__("_database", function() {
		return database;
	});
	
	this.__defineGetter__("_lockedAccounts", function() {
		return lockedAccounts;
	});
}

AccountList.prototype.createAccount = function(accountName, callback)
{
	var accountList = this;
	this.doesAccountExist(accountName, function(result) {
		if (result)
		{
			callback(false, "Account already exists");
		}
		else
		{
			var result = new Account.newAccount(accountName, accountList._database);
			result.commitChanges(callback);
		}
	});
}

AccountList.prototype.doesAccountExist = function(accountName, callback)
{
	this._database.openDoc(accountName).then(function(doc) {
		callback(doc != null);
	});
}

AccountList.prototype.accessAccount = function(accountName, callback)
{
	var accountList = this;

	if (this._lockedAccounts[accountName])
	{
		var result = this._lockedAccounts[accountName];
		result.addLock();
		callback(result);
	}
	else
	{
		this._database.openDoc(accountName).then(function(doc) {
			if (doc)
			{
				var result = new Account(doc, accountList._database);
				result.addLock();
				accountList._lockedAccounts[accountName] = result;
				callback(result);
			}
			else
			{
				callback(null, "Account doesn't exist");
			}
		});
	}
}

AccountList.prototype.accessComplete = function(account, callback)
{
	var accountList = this;
	var accountName = account.id;

	if (this._lockedAccounts[accountName])
	{
		var account = this._lockedAccounts[accountName];
		
		// the account is no longer used in memory, save
		// any changes to the database
		if (account.removeLock() == 0)
		{
			account.commitChanges(function() {
				// verify that the account is still unused
				// before removing the shared account class
				if (account.lockCount == 0)
				{
					delete accountList._lockedAccounts[accountName];
				}
				
				callback();
			});
		}
	}
	else
	{
		callback();
	}
}

module.exports = AccountList;