const { ResponseCodes } = require('../Constants/constants');
const UpgradeService = require('../Services/Common.Services/Upgrade.Service');
const Response = require('../Utils/Response.Helper');
const CryptoHelper = require('../Utils/Crypto.Helper');
const settings = require('../settings.json').settings;
const { getMaintainerPubKey } = require('../Constants/Config');

class UpgradeController {
  constructor(message) {
    this.msg = message;
    this.svc = new UpgradeService(message, settings.dbPath, settings);
  }

  async handle(isReadOnly) {
    try {
      if (isReadOnly) return Response.error(ResponseCodes.FORBIDDEN, 'Readonly mode not allowed for upgrades');
      const maintainer = getMaintainerPubKey();
      const caller = (this.msg.userPubKey || '').toLowerCase();
      if (!maintainer || !caller || maintainer !== caller) {
        return Response.error(ResponseCodes.UNAUTHORIZED, 'Unauthorized');
      }
      // Dual auth: verify signature
      const zipBuf = Buffer.isBuffer(this.msg.data && this.msg.data.content) ? this.msg.data.content : Buffer.from((this.msg.data && this.msg.data.content && this.msg.data.content.buffer) || []);
      const sigHex = this.msg.signature || '';
      const ok = await CryptoHelper.verifyEd25519(zipBuf, sigHex, caller);
      if (!ok) return Response.error(ResponseCodes.UNAUTHORIZED, 'Invalid signature');

      switch ((this.msg.Action || '').toLowerCase()) {
        case 'upgradecontract': {
          const res = await this.svc.upgrade();
          return Response.success(res);
        }
        default:
          return Response.error(ResponseCodes.BAD_REQUEST, 'Unknown Action');
      }
    } catch (e) {
      const code = e.code || ResponseCodes.INTERNAL_ERROR;
      return Response.error(code, e.message || 'Error');
    }
  }
}

module.exports = UpgradeController;
