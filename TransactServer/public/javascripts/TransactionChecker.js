

function startChecking(token, callback)
{
	var lastTime = new Date();
	var timeTolerance = 1000;

	function checkPayment()
	{
		
	}

	document.body.onfocus = checkPayment;

	function checkForResultReturn()
	{
		var thisTime = new Date();
		
		if (thisTime - lastTime > timeTolerance)
		{
			checkPayment(callback);
		}
		
		lastTime = thisTime;
		requestAnimationFrame(checkForResultReturn);
	}

	checkForResultReturn();
}