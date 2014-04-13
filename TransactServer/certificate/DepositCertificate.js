
function DepositCertificate(data)
{	
	this.__defineGetter__("recepientID", function() {
		return data['rec'];
	});
	
	this.__defineGetter__("keypairID", function() {
		return data['key'];
	});
	
	this.__defineGetter__("amount", function() {
		return parseInt(data['am']);
	});
	
	this.__defineGetter__("timestamp", function() {
		return data['t'];
	});
	
	this.__defineGetter__("signature", function() {
		return data['sig'];
	});
	
	this.__defineGetter__("digestInput", function() {
		return this.recepientID + ',' + this.keypairID + ',' + this.amount + ',' + this.timestamp;
	});
}

DepositCertificate.requiredFields = [
	"rec", // Recipient account id
	"key", // key pair id
	"am", // amount
	"t", // unix timestamp
	"sig", // ditigal signature
];

DepositCertificate.parse = function(text)
{
	var lines = text.split('\n');
	
	var data = {};
	
	for (var i = 0; i < lines.length; ++i)
	{
		var lineSplit = lines[i].split(": ", 2);
		
		if (lineSplit.length != 2)
		{
			console.log(i + ',' + lineSplit.length + ',' + lines[i]);
			throw new Error("Malformed certificate");
		}
		
		data[lineSplit[0]] = lineSplit[1];
	}
	
	for (var i = 0; i < DepositCertificate.requiredFields.length; ++i)
	{
		if (data[DepositCertificate.requiredFields[i]] == null)
		{
			throw new Error("Missing field in certificate: " + DepositCertificate.requiredFields[i]);
		}
	}
	
	return new DepositCertificate(data);
}

module.exports = DepositCertificate;