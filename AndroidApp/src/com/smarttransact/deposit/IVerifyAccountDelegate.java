package com.smarttransact.deposit;

public interface IVerifyAccountDelegate
{
	void accountVerified(String name);
	void accountVerificationError(String message);
}
