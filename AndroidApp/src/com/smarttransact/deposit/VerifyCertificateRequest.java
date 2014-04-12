package com.smarttransact.deposit;

import java.io.IOException;
import java.net.URI;

import android.util.JsonReader;

import com.example.helloworld.ServerRequest;

public class VerifyCertificateRequest extends ServerRequest {
	
	private IVerifyCertificateDelegate delegate;

	public VerifyCertificateRequest(Certificate cert, IVerifyCertificateDelegate delegate) {
		super("/deposit/verify", "POST");
		addPostParameter("cert", cert.toString());
		this.delegate = delegate;
	}

	@Override
	protected void requestComplete(JsonReader result) {

		try
		{
			 while (result.hasNext()) {
				 String name = result.nextName();
	 
				if (name.equals("result")) 
				{
					if (result.nextBoolean())
					{
						delegate.certificateVerified();
					}
					else
					{
						delegate.certificateInvalid("Certificate not valid");
					}
				}
				else if (name.equals("error"))
				{
					delegate.certificateInvalid(result.nextString());
				}
			 }
		}
		catch (IOException e)
		{
			delegate.certificateInvalid("Invalid json response");
		}
	}
}
