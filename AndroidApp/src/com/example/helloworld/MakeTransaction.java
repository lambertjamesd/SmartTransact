package com.example.helloworld;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import android.net.Uri;
import android.os.AsyncTask;

public class MakeTransaction extends AsyncTask<Uri, Integer, Boolean> {

	@Override
	protected Boolean doInBackground(Uri... params) {
		HttpClient httpclient = new DefaultHttpClient();
	    HttpResponse response;
	    try {
	        response = httpclient.execute(new HttpGet(params[0].toString()));
	        StatusLine statusLine = response.getStatusLine();
	        if(statusLine.getStatusCode() == HttpStatus.SC_OK){
	            ByteArrayOutputStream out = new ByteArrayOutputStream();
	            response.getEntity().writeTo(out);
	            out.close();
	        } else{
	            //Closes the connection.
	            response.getEntity().getContent().close();
	            throw new IOException(statusLine.getReasonPhrase());
	        }
	    } catch (ClientProtocolException e) {
	        //TODO Handle problems..
	    } catch (IOException e) {
	        //TODO Handle problems..
	    }
	    return Boolean.valueOf(true);
	}

}
