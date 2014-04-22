package com.example.helloworld;

import java.security.KeyPair;

import com.smarttransact.account.Account;
import com.smarttransact.account.AccountStore;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

public class AccountCreationActivity extends Activity implements IAccountCreationDelegate, IAccountKeyGeneratorDelegate {
	KeyPair key;
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_create_account);
		AccountKeyGenerator keyGen = new AccountKeyGenerator(this);
		keyGen.execute();
	}
	
	public void signUp(View view)
	{
		TextView title = (TextView)findViewById(R.id.loginTitle);
		EditText accountName = (EditText)findViewById(R.id.accountName);
		EditText accountEmail = (EditText)findViewById(R.id.email);
		if(!accountName.getText().toString().equals("")
				&& !accountEmail.getText().toString().equals(""))
		{
			AccountCreationRequest request = new AccountCreationRequest(accountName.getText().toString(), accountEmail.getText().toString(), key, this);
			request.execute();
		}
	}

	@Override
	public void accountCreated(Account account) {
		AccountStore.saveAccount(getApplicationContext(), "default", account);
		finish();
	}

	@Override
	public void accountError(String message) {
		TextView title = (TextView)findViewById(R.id.loginTitle);
		title.setText(message);
	}

	@Override
	public void keypairFinished(KeyPair keypair) {
		key = keypair;
		Button signup = (Button)findViewById(R.id.loginButton);
		signup.setEnabled(true);
		
	}
}
