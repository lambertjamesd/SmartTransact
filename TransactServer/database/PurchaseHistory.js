
var couchdb = require('couchdb');

function PurchaseHistory(serverPort, serverHost)
{
	var client = couchdb.createClient(serverPort, serverHost);
	var database = client.db('purchases');

	this.__defineGetter__("_database", function() {
		return database;
	});
}

PurchaseHistory.prototype.hasPurchaseHappened = function(purchaseID, callback)
{
	this._database.openDoc(purchaseID).then(function(doc) {
		callback(doc != null);
	});
}

PurchaseHistory.prototype.logPurchase = function(purchaseID, callback)
{
	var purchase = {
		"_id" : purchaseID
	};

	this._database.saveDoc(purchase).then(
		function() {
			callback(true);
		}
	);
}

module.exports = PurchaseHistory;