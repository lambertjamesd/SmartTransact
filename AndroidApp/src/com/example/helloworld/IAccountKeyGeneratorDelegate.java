package com.example.helloworld;

import java.security.KeyPair;

public interface IAccountKeyGeneratorDelegate {
	void keypairFinished(KeyPair keypair);
}
