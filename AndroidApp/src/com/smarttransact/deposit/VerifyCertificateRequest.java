package com.smarttransact.deposit;

import java.net.URI;

import android.util.JsonReader;

import com.example.helloworld.ServerRequest;

public class VerifyCertificateRequest extends ServerRequest {

	public VerifyCertificateRequest(Certificate cert) {
		super("/deposit/verify", "POST");
		addPostParameter("cert", cert.toString());
	}

	@Override
	protected void requestComplete(JsonReader result) {
		// TODO Auto-generated method stub

	}

}
