package com.example.helloworld;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyPair;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import com.smarttransact.account.Account;
import com.smarttransact.account.AccountStore;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

public class MainActivity extends Activity
{
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		//Account test = new Account("foobar", null, "key");
		//AccountStore.saveAccount(getApplicationContext(), "default", test);
		
		//Account load = AccountStore.loadAccount(getApplicationContext(), "default");
		//System.out.println(load.getAccountID());
		//System.out.println(load.getKeyID());
	}
	
	public void createAccount(View view)
	{
		Intent createIntent = new Intent(this, AccountCreationActivity.class);
		startActivity(createIntent);
	}
	
	/*public void sendHTTPRequest(View view)
	{
		TextView url = (TextView)findViewById(R.id.url_input);
		final TextView output = (TextView)findViewById(R.id.request_result);
		url.setText("http://www.google.com");
		final HttpClient httpclient = new DefaultHttpClient();
	    
	    final HttpGet get = new HttpGet(url.getText().toString());
	    output.setText(get.getURI().toString());
		try {
			AsyncTask<Void, Void, String> task = new AsyncTask<Void, Void, String>(){

				@Override
				protected String doInBackground(Void... params) {
					HttpResponse response = null;
					try {
						response = httpclient.execute(get);
					} catch (ClientProtocolException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
						return null;
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
						return null;
					}
					StatusLine statusLine = response.getStatusLine();
				    if(statusLine.getStatusCode() == HttpStatus.SC_OK){
				        ByteArrayOutputStream out = new ByteArrayOutputStream();
				        try {
							response.getEntity().writeTo(out);
					        out.close();
					        return out.toString();
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
				        output.setText(out.toString());
				        //..more logic
				    } else{
				        //Closes the connection.
				        try {
							response.getEntity().getContent().close();
							return statusLine.getReasonPhrase();
						} catch (IllegalStateException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
				    }
				    return "Error";
				}
				@Override
			    protected void onPostExecute(String result) {
					if(result != null)
					{
						output.setText(result);
					}
			    }
			};
			task.execute();
		
		} catch (Exception e){
			output.setText(e.toString());
		}
	}*/
}
