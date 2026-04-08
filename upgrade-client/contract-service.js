const HotPocket = require('hotpocket-js-client');
const bson = require('bson');
const sodium = require('libsodium-wrappers');

class ContractService {
  constructor(servers) {
    this.servers = servers;
    this.client = null;
    this.userKeyPair = null;
    this.connected = false;
  }

  async init() {
    if (!this.userKeyPair) this.userKeyPair = await HotPocket.generateKeys();
    if (!this.client) this.client = await HotPocket.createClient(this.servers, this.userKeyPair, { protocol: HotPocket.protocols.bson });
    if (!await this.client.connect()) throw new Error('Connection failed');
    this.connected = true;
  }

  async sign(buf) {
    await sodium.ready;
    const sig = sodium.crypto_sign_detached(buf, this.userKeyPair.privateKey);
    return Buffer.from(sig).toString('hex');
  }

  async submitUpgrade(zipBuffer, version, description) {
    const signature = await this.sign(zipBuffer);
    const payload = {
      Service: 'Upgrade',
      Action: 'UpgradeContract',
      data: { version, description, content: zipBuffer },
      signature
    };
    await this.client.submitContractInput(bson.serialize(payload));
  }
}

module.exports = ContractService;
