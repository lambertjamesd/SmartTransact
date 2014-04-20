package com.example.helloworld;

import com.smarttransact.account.Account;

public interface IAccountBalanceDelegate {
	void accountBalance(String data, String key);
	void accountError(String message);
}
