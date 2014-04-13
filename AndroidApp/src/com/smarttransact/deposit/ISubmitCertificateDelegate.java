package com.smarttransact.deposit;

public interface ISubmitCertificateDelegate {
	void certificateSubmitted();
	void certificateSubmitError(String error);
}
