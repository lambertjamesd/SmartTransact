package com.example.helloworld;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAKey;
import java.util.Arrays;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.smarttransact.account.Account;
import com.smarttransact.account.AccountStore;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Base64;
import android.util.JsonReader;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class AccountBalanceActivity extends Activity implements IAccountBalanceDelegate {
	Account account;
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_account_balance);
		Button recheck = (Button)findViewById(R.id.balanceRefresh);
		account = AccountStore.loadAccount(getApplicationContext(), "default");
		AccountBalanceRequest request = new AccountBalanceRequest(account, this);
		request.execute();
	}
	
	public void logout(View view)
	{
		AccountStore.removeAccount(getApplicationContext(), "default");
		finish();
	}
	public void recheck(View view)
	{
		AccountBalanceRequest request = new AccountBalanceRequest(account, this);
		request.execute();
	}

	@Override
	public void accountBalance(String data, String key) {
		TextView name = (TextView)findViewById(R.id.balanceNameTitle);
		TextView error = (TextView)findViewById(R.id.accountBalanceError);
		name.setText("Account Name");
		TextView nameValue = (TextView)findViewById(R.id.balanceNameValue);
		TextView balance = (TextView)findViewById(R.id.balanceTitle);
		TextView balanceValue = (TextView)findViewById(R.id.balanceValue);
		name.setVisibility(View.VISIBLE);
		nameValue.setVisibility(View.VISIBLE);
		balance.setVisibility(View.VISIBLE);
		balanceValue.setVisibility(View.VISIBLE);
		error.setVisibility(View.GONE);
		Cipher decryptCipher = null;
		try {
			byte[] keyBytes = Base64.decode(key, Base64.NO_WRAP);
			byte[] dataBytes = Base64.decode(data, Base64.NO_WRAP);
			decryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-1AndMGF1Padding");
			decryptCipher.init(Cipher.DECRYPT_MODE, account.getKey().getPrivate());
			byte[] decrypted = decryptCipher.doFinal(keyBytes);
			byte[] aesKey = Arrays.copyOfRange(decrypted, 0, 16);
			byte[] aesIV = Arrays.copyOfRange(decrypted, 16, 32);
			
			Cipher aesCipher = Cipher.getInstance("AES/CBC/NoPadding");
		    aesCipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(aesKey, "AES"), new IvParameterSpec(aesIV));
		    String plainText = new String(aesCipher.doFinal(dataBytes), "UTF-8");
		    JsonReader result = new JsonReader(new StringReader(plainText));
		    try {
				result.beginObject();
				while(result.hasNext())
				{
					String nextName = result.nextName();
					if(nextName.equals("name"))
					{
						nameValue.setText(result.nextString());
					}
					else if(nextName.equals("balance"))
					{
						balanceValue.setText(result.nextString());
					}
					else
					{
						result.skipValue();
					}
				}
			    result.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			}
			catch (Exception e)
			{
				e.printStackTrace();
				return;
			}
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchPaddingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvalidKeyException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalBlockSizeException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (BadPaddingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvalidAlgorithmParameterException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public void accountError(String message) {
		TextView name = (TextView)findViewById(R.id.balanceNameTitle);
		TextView nameValue = (TextView)findViewById(R.id.balanceNameValue);
		TextView balance = (TextView)findViewById(R.id.balanceTitle);
		TextView balanceValue = (TextView)findViewById(R.id.balanceValue);
		TextView error = (TextView)findViewById(R.id.accountBalanceError);
		error.setVisibility(View.VISIBLE);
		name.setVisibility(View.GONE);
		nameValue.setVisibility(View.GONE);
		balance.setVisibility(View.GONE);
		balanceValue.setVisibility(View.GONE);
		error.setText(message);
		
	}
}
