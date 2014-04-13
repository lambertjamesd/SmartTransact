package com.example.helloworld;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;

import com.smarttransact.account.Account;
import com.smarttransact.account.AccountStore;
import com.smarttransact.deposit.Certificate;
import com.smarttransact.deposit.ISubmitCertificateDelegate;
import com.smarttransact.deposit.IVerifyAccountDelegate;
import com.smarttransact.deposit.IVerifyCertificateDelegate;
import com.smarttransact.deposit.SubmitCertificateRequest;
import com.smarttransact.deposit.VerifyAccountRequest;
import com.smarttransact.deposit.VerifyCertificateRequest;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

public class TransactionActivity extends Activity implements IVerifyAccountDelegate, IVerifyCertificateDelegate, ISubmitCertificateDelegate
{
	private Account account;
	private TextView recipient;
	private TextView amountText;
	
	private String accountID;
	private int amount;
	
	private Certificate cert;
	
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
		
		account = AccountStore.loadAccount(getApplicationContext(), "default");
		
		if (account == null)
		{
			showError("Not signed in");
			hidePaymentInfo();
		}
		else
		{
			Intent intent = getIntent();
			Uri data = intent.getData();
			
			recipient = (TextView)findViewById(R.id.transaction_recipient);
			amountText = (TextView)findViewById(R.id.transasction_amount);
			
			accountID = data.getQueryParameter("rec");
			String am = data.getQueryParameter("am");
			
			if (accountID == null || accountID.length() == 0 || am == null || am.length() == 0)
			{
				showError("Invalid payment url");
				hidePaymentInfo();
			}
			else
			{
				amount = Integer.parseInt(am);
				
				VerifyAccountRequest accountRequest = new VerifyAccountRequest(accountID, this);
				accountRequest.execute();
				
				recipient.setText("...");
				amountText.setText(data.getQueryParameter("am"));
			}
		}
	}
	
	public void confirmTransaction(View view)
	{
		cert = new Certificate(accountID, account.getKeyID(), amount, new Date());
		cert.addSignature(account.signString(cert.getSignatureData()));
		VerifyCertificateRequest verify = new VerifyCertificateRequest(cert, this);
		verify.execute();
	}
	
	public void cancelTransaction(View view)
	{
		finish();
	}

	@Override
	public void accountVerified(String name) {
		recipient.setText(name);
	}

	@Override
	public void accountVerificationError(String message) {
		showError(message);
		hidePaymentInfo();
	}

	@Override
	public void certificateVerified()
	{
		try 
		{
			Intent intent = getIntent();
			Uri data = intent.getData();
			
			URI submitURI = new URI("http", data.getHost(), data.getPath(), data.getQuery(), null);
			SubmitCertificateRequest verify = new SubmitCertificateRequest(submitURI, cert, this);
			verify.execute();
		}
		catch (URISyntaxException e)
		{
			showError("Invalid submit url");
		}
	}

	@Override
	public void certificateInvalid(String error)
	{
		showError(error);
	}

	@Override
	public void certificateSubmitted()
	{
		finish();
	}

	@Override
	public void certificateSubmitError(String error)
	{
		showError(error);
	}
}
