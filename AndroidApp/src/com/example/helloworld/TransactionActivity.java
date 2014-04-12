package com.example.helloworld;

import com.smarttransact.account.Account;
import com.smarttransact.account.AccountStore;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

public class TransactionActivity extends Activity
{
	private void showError(String error)
	{
		TextView errorView = (TextView)findViewById(R.id.transaction_error);
		errorView.setVisibility(View.VISIBLE);
		errorView.setText(error);
	}
	
	private void hidePaymentInfo()
	{
		TextView recipient = (TextView)findViewById(R.id.transaction_recipient);
		TextView amount = (TextView)findViewById(R.id.transasction_amount);
		TextView toLabel = (TextView)findViewById(R.id.transact_to_label);
		
		recipient.setVisibility(View.GONE);
		amount.setVisibility(View.GONE);
		toLabel.setVisibility(View.GONE);
	}
	
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_transaction);
		
		Account account = AccountStore.loadAccount(getApplicationContext(), "default");
		
		if (account == null)
		{
			showError("Not signed in");
			hidePaymentInfo();
		}
		else
		{
			Intent intent = getIntent();
			Uri data = intent.getData();
			
			TextView recipient = (TextView)findViewById(R.id.transaction_recipient);
			TextView amount = (TextView)findViewById(R.id.transasction_amount);
			
			String rec = data.getQueryParameter("rec");
			String am = data.getQueryParameter("am");
			
			if (rec == null || rec.length() == 0 || am == null || am.length() == 0)
			{
				showError("Invalid payment url");
				hidePaymentInfo();
			}
			else
			{
				recipient.setText(data.getQueryParameter("rec"));
				amount.setText(data.getQueryParameter("am"));
			}
		}
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
