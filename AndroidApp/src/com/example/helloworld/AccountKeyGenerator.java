package com.example.helloworld;

import java.security.Key;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;

import android.os.AsyncTask;
import android.util.Base64;

public class AccountKeyGenerator extends AsyncTask<Void, Void, KeyPair> {
	
	private final String encryptionAlgorithm = "RSA";
	private final int keySize = 2048;
	
	private IAccountKeyGeneratorDelegate delegate;

	public static String encodeAsPem(Key key, String pemType)
	{
		String base64 = Base64.encodeToString(key.getEncoded(), Base64.NO_WRAP);
		
		StringBuilder result = new StringBuilder();
		result.append("-----BEGIN " + pemType + "-----\n");
		
		int keyIndex = 0;
		int strideLength = 64;
		
		while (keyIndex + strideLength < base64.length())
		{
			result.append(base64.substring(keyIndex, keyIndex + strideLength));
			result.append('\n');
			
			keyIndex += strideLength;
		}
		
		result.append(base64.substring(keyIndex));
		result.append('\n');

		result.append("-----END " + pemType + "-----\n");
		
		return result.toString();
	}
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
