
var couchdb = require('couchdb');
var Account = require('./Account');
var UserPublicKey = require('../certificate/UserPublicKey');

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

AccountList.prototype.createAccount = function(email, name, publicKey, callback)
{
	var accountList = this;
	this.doesAccountExist(email, function(result) {
		if (result)
		{
			callback(null, "Email already is use");
		}
		else
		{
			var result = new Account.newAccount(email, name, accountList._database);
			result.addKey(publicKey);
			result.commitChanges(function(commitResult, error) {
				if (commitResult)
				{
					callback(result);
				}
				else
				{
					callback(null, error);
				}
			});
		}
	});
}

AccountList.prototype.doesAccountExist = function(email, callback)
{
	this._database.view("email", "all", {key:email}).then(function(result) {
		callback(result.rows.length > 0);
	});
}

AccountList.prototype.accessAccountList = function(nameList, callback)
{
	var accountList = this;
	
	var accessedAccounts = {};
	var remainingCount = nameList.length;
	var failedAccountNames = [];
	
	function accessSingleAccount(accountName)
	{
		accountList.accessAccount(nameList[i], function(account, error) {
			if (account)
			{
				accessedAccounts[accountName] = account;
			}
			else
			{
				failedAccountNames.push(accountName);
			}
			
			--remainingCount;
			
			if (remainingCount == 0)
			{
				if (failedAccountNames.length > 0)
				{
					accountList.accessCompleteMultiple(accessedAccounts, function() {
						callback(null, "Accounts not found: " + failedAccountNames.join(", "));
					});
				}
				else
				{
					callback(accessedAccounts);
				}
			}
		});
	}
	
	for (var i = 0; i < nameList.length; ++i)
	{
		accessSingleAccount(nameList[i]);
	}
}

AccountList.prototype.accessAccountUsingEmail = function(email, callback)
{
	var accountList = this;
	
	this._database.view("email", "all", {key:email}).then(function(result) {
		if (result.rows.length > 0)
		{
			accountList.accessAccount(result.rows[0].id, callback);
		}
		else
		{
			callback(null, "Account not found");
		}
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
				// make sure that the account isn't opened twice
				if (!accountList._lockedAccounts[accountName])
				{
					var result = new Account(doc, accountList._database);
					result.addLock();
					accountList._lockedAccounts[accountName] = result;
					callback(result);
				}
				else
				{
					var result = accountList._lockedAccounts[accountName];
					result.addLock();
					callback(result);
				}
			}
			else
			{
				callback(null, "Account doesn't exist");
			}
		});
	}
}

AccountList.prototype.accessCompleteMultiple = function(accountMap, callback)
{
	var remainingCount = Object.keys(accountMap).length;
	
	for (var accountName in accountMap)
	{
		this.accessComplete(accountMap[accountName], function() {
			--remainingCount;
			
			if (remainingCount == 0)
			{
				callback();
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

AccountList.prototype.accountWithKeypairID = function(keypairID, callback)
{
	var accountList = this;

	this._database.view("keys", "id",{"key":keypairID}).then(function(queryResult) {
		if (queryResult.rows.length == 0)
		{
			callback(null);
		}
		else
		{
			callback(queryResult.rows[0].id, new UserPublicKey(queryResult.rows[0].value));
			
			if (queryResult.rows.length > 1)
			{
				console.log("Multiple keys with the id " + keypairID);
			}
		}
	});
}

AccountList.prototype.transfer = function(sourceAccount, targetAccount, amount, callback)
{
	var accountList = this;
	
	accountList.accessAccountList([sourceAccount, targetAccount], function(accounts, error) {
		if (accounts)
		{
			var source = accounts[sourceAccount];
			var destination = accounts[targetAccount];
			
			source.withdraw(amount);
			destination.deposit(amount);
			
			accountList.accessCompleteMultiple(accounts, function() {
				callback(true);
			});
		}
		else
		{
			callback(false, error);
		}
	});
}

module.exports = AccountList;