package com.example.helloworld;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

public class MainActivity extends Activity
{
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
	}
	
	public void createAccount(View view)
	{
		Intent createIntent = new Intent(this, AccountCreationActivity.class);
		startActivity(createIntent);
	}
}
