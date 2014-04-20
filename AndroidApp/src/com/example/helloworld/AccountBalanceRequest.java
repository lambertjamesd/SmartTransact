package com.example.helloworld;

import java.io.IOException;
import java.security.KeyPair;

import com.smarttransact.account.Account;

import android.util.JsonReader;

public class AccountBalanceRequest extends ServerRequest {
	IAccountBalanceDelegate delegate;
	AccountBalanceRequest(Account account, IAccountBalanceDelegate delegate)
	{
		super("/account/" + account.getAccountID() + "?key=" + account.getKeyID() , "GET");
		this.delegate = delegate;
	}
	@Override
	protected void requestComplete(JsonReader result) {
		String errorMessage = "";
		String data = "";
		String key = "";
		if(result == null)
		{
			delegate.accountError("no reader returned");
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
				else if(name.equals("data"))
				{
					data = result.nextString();
				}
				else if(name.equals("key"))
				{
					key = result.nextString();
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
		delegate.accountBalance(data, key);

	}

}
