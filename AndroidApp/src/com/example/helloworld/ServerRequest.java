package com.example.helloworld;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyPair;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.json.JSONException;
import org.json.JSONObject;

import android.net.Uri;
import android.os.AsyncTask;
import android.util.JsonReader;

public abstract class ServerRequest extends AsyncTask<Void, Integer, JsonReader>
{
	final private static String serverURI = "http://www.smarttransactapp.com";
	private Map<String, String> parameters = new HashMap<String, String>();
	
	private URI uri;
	private String method;
	
	protected ServerRequest(URI uri, String method)
	{
		this.uri = uri;
		this.method = method;
	}
	
	protected ServerRequest(String path, String method)
	{
		try {
			this.uri = new URI(serverURI + path);
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		this.method = method;
	}
	
	protected void addPostParameter(String key, String value)
	{
		parameters.put(key, value);
	}
	
	private String jsonParameters()
	{
		JSONObject result = new JSONObject();
		
		try
		{
			for (Map.Entry<String, String> entry : parameters.entrySet())
			{
				result.put(entry.getKey(), entry.getValue());
			};
		}
		catch (JSONException e)
		{
			return "{}";
		}
		
		return result.toString();
	}

	@Override
	protected JsonReader doInBackground(Void... params) {
		HttpClient httpclient = new DefaultHttpClient();
	    HttpResponse response;

	    try {	
		    HttpUriRequest request = null;
		    
		    if (method.equals("GET"))
		    {
		    	request = new HttpGet(uri);
		    }
		    else if (method.equals("POST"))
		    {
		    	HttpPost postRequest = new HttpPost(uri);
	
		        //sets the post request as the resulting string
		        postRequest.setEntity(new StringEntity(jsonParameters()));
		        //sets a request header so the page receving the request
		        //will know what to do with it
		        postRequest.setHeader("Accept", "application/json");
		        postRequest.setHeader("Content-type", "application/json");
	
		        
		    	request = postRequest;
		    }
		    else
		    {
		    	System.out.println(method + " not recognized");
		    }
		        response = httpclient.execute(request);
		        return new JsonReader(new InputStreamReader(response.getEntity().getContent(), "UTF-8"));
	        
	    } catch (ClientProtocolException e) {
	        System.out.println(e.toString());
	    } catch (IOException e) {
	    	System.out.println(e.toString());
	    }

	    return null;
	}
	
	@Override
    protected void onPostExecute(JsonReader result)
	{
		requestComplete(result);
	}
	
	protected abstract void requestComplete(JsonReader result);
}
