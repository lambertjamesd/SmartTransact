
var couchdb = require('couchdb');

function TransactionHistory(serverPort, serverHost)
{
	var client = couchdb.createClient(serverPort, serverHost);
	var database = client.db('transactions');

	this.__defineGetter__("_database", function() {
		return database;
	});
}

TransactionHistory.prototype.hasDepositHappened = function(deposit, callback)
{
	this._database.view("history", "all",{"key":deposit.digestInput}).then(function(queryResult) {
		callback(queryResult.rows.length > 0);
	});
}

TransactionHistory.prototype.logDeposit = function(deposit, sender, callback)
{
	var deposit = {
		"recipient" : deposit.recepientID,
		"sender" : sender,
		"keypair" : deposit.keypairID,
		"amount" : deposit.amount,
		"timestamp" : deposit.timestamp,
		"transactionTime" : new Date().getTime()
	};

	this._database.saveDoc(deposit).then(
		function() {
			callback(true);
		}
	);
}

module.exports = TransactionHistory;