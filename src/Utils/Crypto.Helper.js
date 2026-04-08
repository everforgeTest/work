const sodium = require('libsodium-wrappers');

module.exports = {
  verifyEd25519: async (dataBuffer, signatureHex, pubKeyHex) => {
    await sodium.ready;
    try {
      const sig = Buffer.from(signatureHex, 'hex');
      const pk = Buffer.from(pubKeyHex, 'hex');
      return sodium.crypto_sign_verify_detached(sig, dataBuffer, pk);
    } catch (e) {
      return false;
    }
  }
};
