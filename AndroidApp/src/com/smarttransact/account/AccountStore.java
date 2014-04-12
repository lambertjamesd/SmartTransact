package com.smarttransact.account;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import android.content.Context;

public class AccountStore {

	public static Account loadAccount(Context context, String accountName)
	{
		try
		{
			FileInputStream fileStream = context.openFileInput(accountName);
			ObjectInputStream objectStream = new ObjectInputStream(fileStream);
			Account result = (Account)objectStream.readObject();
			objectStream.close();
			fileStream.close();
			return result;
		}
		catch (IOException exception)
		{
			return null;
		} 
		catch (ClassNotFoundException exception) 
		{
			exception.printStackTrace();
			return null;
		}
	}
	
	public static void saveAccount(Context context, String accountName, Account account)
	{
		try
		{
			FileOutputStream fileStream = context.openFileOutput(accountName, Context.MODE_PRIVATE);
	        ObjectOutputStream objectStream = new ObjectOutputStream(fileStream);
	        objectStream.writeObject(account);
	        objectStream.close();
	        fileStream.close();
		} 
		catch (IOException exception) 
		{
			exception.printStackTrace();
		}
	}
	
	public static void removeAccount(Context context, String accountName)
	{
		context.deleteFile(accountName);
	}
}
