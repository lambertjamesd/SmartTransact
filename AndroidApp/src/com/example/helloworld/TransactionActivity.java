package com.example.helloworld;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

public class TransactionActivity extends Activity
{
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_transaction);
		
		Intent intent = getIntent();
		Uri data = intent.getData();
		
		TextView textView = (TextView)findViewById(R.id.test_label);
		
		textView.setText(data.getQueryParameter("t"));
	}
	
	public void confirmTransaction(View view)
	{
		finish();
	}
	
	public void cancelTransaction(View view)
	{
		finish();
	}
}
