package com.example.helloworld;

import com.smarttransact.account.Account;

public interface IAccountCreationDelegate {
	void accountCreated(Account account);
	void accountError(String message);
}
