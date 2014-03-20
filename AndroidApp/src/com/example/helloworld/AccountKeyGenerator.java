package com.example.helloworld;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;

import android.os.AsyncTask;

public class AccountKeyGenerator extends AsyncTask<Void, Void, KeyPair> {
	
	private final String encryptionAlgorithm = "RSA";
	private final int keySize = 2048;
	
	private IAccountKeyGeneratorDelegate delegate;
	
	public AccountKeyGenerator(IAccountKeyGeneratorDelegate delgate)
	{
		this.delegate = delgate;
	}

	@Override
	protected KeyPair doInBackground(Void... params) {

		try
		{
			KeyPairGenerator generator = KeyPairGenerator.getInstance(encryptionAlgorithm);
			generator.initialize(keySize);
			return generator.generateKeyPair();
		}
		catch (NoSuchAlgorithmException exception)
		{
			System.err.println(exception.toString());
		}
		
		return null;
	}

	@Override
    protected void onPostExecute(KeyPair result) {
		delegate.keypairFinished(result);
    }
}
