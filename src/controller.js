const { ServiceTypes } = require('./Constants/constants');
const UserController = require('./Controllers/User.Controller');
const AuthController = require('./Controllers/Auth.Controller');
const UpgradeController = require('./Controllers/Upgrade.Controller');
const ContractController = require('./Controllers/Contract.Controller');
const Response = require('./Utils/Response.Helper');
const bson = require('bson');

class ControllerRouter {
  async handle(ctx, user, buf) {
    let msg = null;
    try {
      msg = JSON.parse(buf);
    } catch (e) {
      try { msg = bson.deserialize(buf); } catch (ex) { msg = null; }
    }
    if (!msg || typeof msg !== 'object') {
      await user.send(Response.error(400, 'Invalid message'));
      return;
    }

    // Attach caller pubkey
    user.pubKeyHex = Buffer.isBuffer(user.publicKey) ? Buffer.from(user.publicKey).toString('hex') : (user.publicKeyHex || user.pubKey || user.publicKey || '');
    msg.userPubKey = (user.pubKeyHex || '').toLowerCase();

    let res = null;
    const isReadOnly = !!ctx.readonly;
    const svc = (msg.Service || msg.service || '').toString();

    try {
      switch (svc) {
        case ServiceTypes.USER: {
          const c = new UserController(msg);
          res = await c.handle();
          break;
        }
        case ServiceTypes.AUTH: {
          const c = new AuthController(msg);
          res = await c.handle();
          break;
        }
        case ServiceTypes.UPGRADE: {
          const c = new UpgradeController(msg);
          res = await c.handle(isReadOnly);
          break;
        }
        case ServiceTypes.CONTRACT: {
          const c = new ContractController(msg);
          res = await c.handle(ctx);
          break;
        }
        default:
          res = Response.error(400, 'Unknown Service');
      }
    } catch (e) {
      res = Response.error(e.code || 500, e.message || 'Error');
    }

    // Send response
    await user.send(res);
  }
}

module.exports = ControllerRouter;
