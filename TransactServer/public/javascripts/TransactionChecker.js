

function startChecking(token, callback)
{
	var lastTime = new Date();
	var timeTolerance = 1000;
	
	var paymentSuccessful = false;

	function checkPayment()
	{
		var request = new XMLHttpRequest();
		request.open( "GET", "/example/verify/" + token, false );
		request.onload = function (e) {
			if (request.readyState === 4) {
				if (request.status === 200) {
					var result = JSON.parse(request.responseText);
					
					if (result.result)
					{
						paymentSuccessful = true;
						callback(true);
					}
				} else {
					console.error(request.statusText);
				}
			}
		};
		request.send(null);
		
		paymentSuccessful = true;
	}

	document.body.onfocus = checkPayment;

	function checkForResultReturn()
	{
		var thisTime = new Date();
		
		if (thisTime - lastTime > timeTolerance)
		{
			checkPayment();
		}
		
		lastTime = thisTime;
		
		if (!paymentSuccessful)
		{
			requestAnimationFrame(checkForResultReturn);
		}
	}

	checkForResultReturn();
}