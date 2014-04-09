package com.example.helloworld;

import java.security.KeyPair;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

public class AccountCreationActivity extends Activity {
	KeyPair key;
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_create_account);
		AccountKeyGenerator keyGen = new AccountKeyGenerator();
		key = keyGen.doInBackground();
		
	}
	
	public void signUp(View view)
	{
		TextView title = (TextView)findViewById(R.id.loginTitle);
		TextView title = (TextView)findViewById(R.id.loginTitle);
		EditText accountName = (EditText)findViewById(R.id.accountName);
		EditText accountEmail = (EditText)findViewById(R.id.email);
		
		finish();
	}
}
