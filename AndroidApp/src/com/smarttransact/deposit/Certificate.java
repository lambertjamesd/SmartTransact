package com.smarttransact.deposit;

import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import java.util.SimpleTimeZone;
import java.util.TimeZone;

public class Certificate {
	private String recipientID;
	private String keyID;
	private int amount;
	private Date timestamp;
	private String signature;
	
	public Certificate(String recipientID, String keyID, int amount, Date timestamp)
	{
		this.recipientID = recipientID;
		this.keyID = keyID;
		this.amount = amount;
		this.timestamp = timestamp;
	}
	
	public String getUTCDate()
	{
		SimpleDateFormat dateFormat = new SimpleDateFormat(
            "EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
        dateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
        return dateFormat.format(timestamp);
	}
	
	public String getSignatureData()
	{
		StringBuilder result = new StringBuilder();
		
		result.append(recipientID);
		result.append(",");
		result.append(keyID);
		result.append(",");
		result.append(amount);
		result.append(",");
		result.append(getUTCDate());
		
		return result.toString();
	}
	
	public void addSignature(String signature)
	{
		this.signature = signature;
	}
	
	public String toString()
	{
		StringBuilder result = new StringBuilder();
		
		result.append("rec: ");
		result.append(recipientID);
		result.append("\nkey: ");
		result.append(keyID);
		result.append("\nam: ");
		result.append(amount);
		result.append("\nt: ");
		result.append(getUTCDate());
		result.append("\nsig: ");
		result.append(signature);
		
		return result.toString();
	}
}
