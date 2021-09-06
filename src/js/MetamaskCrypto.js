MetaMaskCrypto={
    getEncryptionPublicKey: function (){
        try {
            ethereum
                .request({
                    method: 'eth_getEncryptionPublicKey',
                    params: [account], // you must have access to the specified account
                })
                .then((result) => {
                    encryptionPublicKey = result;
                })
        } catch (error) {
            if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.info("We can't encrypt anything without the key.");
            } else {
                console.error(error);
            }
        }
    },

    encryptedMessage: function (){
        encryptedMessage = util.bufferToHex(
            window.Buffer.from(
                JSON.stringify(
                    util.e.encrypt(
                        encryptionPublicKey,
                        { data: 'Hello world!' },
                        'x25519-xsalsa20-poly1305'
                    )
                ),
                'utf8'
            )
        )
    },

    decryptMessage: function (){
        try{
            ethereum
                .request({
                    method: 'eth_decrypt',
                    params: [encryptedMessage, '0x784DE6EB308d19C66EB4bb1Ea955cE3b12bfF002'],
                })
                .then((decryptedMessage) =>
                    console.log('The decrypted message is:', decryptedMessage)
                )
        } catch(error) {
            console.log(error.message)
        }
    }
}


