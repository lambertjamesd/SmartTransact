package com.smarttransact.deposit;

import java.io.IOException;
import java.net.URI;

import android.util.JsonReader;

import com.example.helloworld.ServerRequest;

public class SubmitCertificateRequest extends ServerRequest {
	
	private ISubmitCertificateDelegate delegate;

	public SubmitCertificateRequest(URI uri, Certificate cert, ISubmitCertificateDelegate delegate) {
		super(uri, "POST");
		addPostParameter("cert", cert.toString());
		this.delegate = delegate;
	}

	@Override
	protected void requestComplete(JsonReader result)
	{
		if (result == null)
		{
			delegate.certificateSubmitError("Connection Error");
		}
		else
		{
			try
			{
				result.beginObject();
				 while (result.hasNext()) {
					 String name = result.nextName();
		 
					if (name.equals("result")) 
					{
						if (result.nextBoolean())
						{
							delegate.certificateSubmitted();
						}
						else
						{
							delegate.certificateSubmitError("Certificate not valid");
						}
					}
					else if (name.equals("error"))
					{
						delegate.certificateSubmitError(result.nextString());
					}
				 }
				 result.endObject();
			}
			catch (IOException e)
			{
				delegate.certificateSubmitError("Invalid json response");
			}
		}
	}
}
