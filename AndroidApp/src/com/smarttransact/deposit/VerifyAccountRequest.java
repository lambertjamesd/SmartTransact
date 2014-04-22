package com.smarttransact.deposit;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringReader;

import android.util.JsonReader;

import com.example.helloworld.ServerRequest;

public class VerifyAccountRequest extends ServerRequest {
	
	private IVerifyAccountDelegate delegate;
	private ServerKey serverKey;
	private String requestedID;

	public VerifyAccountRequest(String accountID, ServerKey serverKey, IVerifyAccountDelegate delegate)
	{
		super("/verify/" + accountID, "GET");
		this.serverKey = serverKey;
		this.delegate = delegate;
		requestedID = accountID;
	}
	
	private void processInfo(String info, String signature)
	{
		 if (info ==  null)
		 {
			delegate.accountVerificationError("Response missing info");
		 }
		 else if (signature == null)
		 {
			delegate.accountVerificationError("Response missing signature");
		 }
		 else if (!serverKey.validate(info, signature))
		 {
			delegate.accountVerificationError("Could not verify account identity");
		 }
		 else
		 {
			 JsonReader jsonRead = new JsonReader(new StringReader(info));
			 
			 try {
				 String accountName = null;
				 String accountID = null;
				 
				jsonRead.beginObject();
			 
				 while (jsonRead.hasNext())
				 {
				 	String name = jsonRead.nextName();
				 	
				 	if (name.equals("id"))
				 	{
				 		accountID = jsonRead.nextString();
				 	}
				 	else if (name.equals("name"))
				 	{
				 		accountName = jsonRead.nextString();
				 	}
				 }
				 
				 jsonRead.endObject();
				 
				 if (accountName == null)
				 {
					 delegate.accountVerificationError("No account name");
				 }
				 else if (accountID == null)
				 {
					 delegate.accountVerificationError("No account ID specified");
				 }
				 else if (!accountID.equals(requestedID))
				 {
					 delegate.accountVerificationError("Account mismatch");
				 }
				 else
				 {
					 delegate.accountVerified(accountName);
				 }
			 }
			 catch (IOException e)
			 {
				 delegate.accountVerificationError("Info is invalid json response");
			 }
		 }
	}

	@Override
	protected void requestComplete(JsonReader result)
	{
		if (result != null)
		{
			try
			{
				String info = null;
				String signature = null;
				
				result.beginObject();
				while (result.hasNext()) {
					 String name = result.nextName();
		 
					if (name.equals("info")) 
					{
						info = result.nextString();
					}
					else if (name.equals("signature"))
					{
						signature = result.nextString();
					}
					else if (name.equals("error"))
					{
						delegate.accountVerificationError(result.nextString());
						return;
					}
				}
				 
				result.endObject();
				 
				processInfo(info, signature);
			}
			catch (IOException e)
			{
				delegate.accountVerificationError("Invalid json response");
			}
		}
		else
		{
			delegate.accountVerificationError("Connection error");
		}
	}

}
