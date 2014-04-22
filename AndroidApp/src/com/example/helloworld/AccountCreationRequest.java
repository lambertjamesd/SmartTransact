package com.example.helloworld;

import java.io.IOException;
import java.security.KeyPair;

import com.smarttransact.account.Account;

import android.util.JsonReader;


public class AccountCreationRequest extends ServerRequest{
	private IAccountCreationDelegate delegate;
	private KeyPair pair;
	AccountCreationRequest(String accountName, String email, KeyPair keys, IAccountCreationDelegate delegate)
	{
		super("/account" , "POST");
		pair = keys;
		addPostParameter("publicKey", AccountKeyGenerator.encodeAsPem(keys.getPublic(), "PUBLIC KEY"));
		addPostParameter("name", accountName);
		addPostParameter("email", email);
		this.delegate = delegate;
	}
	AccountCreationRequest(String email, KeyPair keys, IAccountCreationDelegate delegate)
	{
		super("/account/key" , "POST");
		pair = keys;
		addPostParameter("publicKey", AccountKeyGenerator.encodeAsPem(keys.getPublic(), "PUBLIC KEY"));
		addPostParameter("email", email);
		this.delegate = delegate;
	}

	@Override
	protected void requestComplete(JsonReader result) {
		String errorMessage = "";
		String keyID = "";
		String accountID = "";
		if(result == null)
		{
			delegate.accountError("no reader returned");
			return;
		}

		try {
			result.beginObject();
			while(result.hasNext())
			{
				String name = result.nextName();
				if(name.equals("error"))
				{
					errorMessage = result.nextString();
					delegate.accountError(errorMessage);
					return;
				}
				else if(name.equals("keyID"))
				{
					keyID = result.nextString();
				}
				else if(name.equals("accountID"))
				{
					accountID = result.nextString();
				}
				else
				{
					result.skipValue();
				}
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			delegate.accountError(e.getMessage());
			return;
		}
		catch (Exception e)
		{
			e.printStackTrace();
			delegate.accountError(e.toString());
			return;
		}
		delegate.accountCreated(new Account(accountID, pair, keyID));
		
	}

}
