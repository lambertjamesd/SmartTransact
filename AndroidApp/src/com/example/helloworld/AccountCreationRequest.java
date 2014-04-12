package com.example.helloworld;

import android.util.JsonReader;


public class AccountCreationRequest extends ServerRequest{
	AccountCreationRequest()
	{
		super("/account" , "POST");
	}

	@Override
	protected void requestComplete(JsonReader result) {
		// TODO Auto-generated method stub
		
	}

}
