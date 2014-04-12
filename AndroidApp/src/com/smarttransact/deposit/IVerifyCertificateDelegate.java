package com.smarttransact.deposit;

public interface IVerifyCertificateDelegate {
	void certificateVerified();
	void certificateInvalid(String error);
}
