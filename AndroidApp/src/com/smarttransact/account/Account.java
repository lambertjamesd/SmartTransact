package com.smarttransact.account;

import java.io.IOException;
import java.io.Serializable;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import android.util.Base64;

public class Account implements Serializable {

	private String accountID;
	private KeyPair key;
	private String keyID;

	/**
	 * 
	 */
	private static final long serialVersionUID = -2419892769521168674L;
	
	public Account(String accountID, KeyPair key, String keyID)
	{
		this.accountID = accountID;
		this.key = key;
		this.keyID = keyID;
	}
	
	public String getAccountID()
	{
		return accountID;
	}
	
	public KeyPair getKey()
	{
		return key;
	}
	
	public String getKeyID()
	{
		return keyID;
	}
	
	public String signString(String input)
	{
		try
		{
			Signature signature = Signature.getInstance("SHA256withRSA");
		    signature.initSign(key.getPrivate());
		    signature.update(input.getBytes());
		    return Base64.encodeToString(signature.sign(), Base64.NO_WRAP);
		}
		catch (NoSuchAlgorithmException exception)
		{
			exception.printStackTrace();
			return null;
		} 
		catch (InvalidKeyException exception)
		{
			exception.printStackTrace();
			return null;
		}
		catch (SignatureException exception)
		{
			exception.printStackTrace();
			return null;
		}
	}
	
	private void writeObject(java.io.ObjectOutputStream out) throws IOException
	{
		out.writeObject(accountID);
		out.writeObject(keyID);
		PKCS8EncodedKeySpec privateSpec = new PKCS8EncodedKeySpec(key.getPrivate().getEncoded());
		out.writeObject(privateSpec.getEncoded());
		
		X509EncodedKeySpec publicSpec = new X509EncodedKeySpec(key.getPublic().getEncoded());
		out.writeObject(publicSpec.getEncoded());
 	}

 	private void readObject(java.io.ObjectInputStream in) throws IOException, ClassNotFoundException
 	{
 		accountID = (String)in.readObject();
 		keyID = (String)in.readObject();

 		byte[] privateData = (byte[])in.readObject();
 		byte[] publicData = (byte[])in.readObject();
 		
 		try
 		{
	 		KeyFactory keyFactory = KeyFactory.getInstance("RSA");

	 		PrivateKey privateKey = keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privateData));
	 		PublicKey publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(publicData));
	 		key = new KeyPair(publicKey, privateKey);
 		}
 		catch (NoSuchAlgorithmException e)
 		{
			e.printStackTrace();
		}
 		catch (InvalidKeySpecException e)
 		{
			e.printStackTrace();
		}
 	}
}
