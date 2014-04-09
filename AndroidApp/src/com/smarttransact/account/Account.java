package com.smarttransact.account;

import java.io.Serializable;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.Signature;
import java.security.SignatureException;

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
}
