const { ResponseCodes } = require('../Constants/constants');
const AuthService = require('../Services/Domain.Services/Auth.Service');
const Response = require('../Utils/Response.Helper');
const settings = require('../settings.json').settings;

class AuthController {
  constructor(message) {
    this.msg = message;
    this.svc = new AuthService(message, settings.dbPath);
  }

  async handle() {
    try {
      switch ((this.msg.Action || '').toLowerCase()) {
        case 'me': {
          const res = await this.svc.me();
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

module.exports = AuthController;
