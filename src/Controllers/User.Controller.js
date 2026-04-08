const { ResponseCodes } = require('../Constants/constants');
const UserService = require('../Services/Domain.Services/User.Service');
const Response = require('../Utils/Response.Helper');
const settings = require('../settings.json').settings;

class UserController {
  constructor(message) {
    this.msg = message;
    this.svc = new UserService(message, settings.dbPath);
  }

  async handle() {
    try {
      switch ((this.msg.Action || '').toLowerCase()) {
        case 'create': {
          const res = await this.svc.create();
          return Response.success(res);
        }
        case 'get': {
          const res = await this.svc.getById();
          return Response.success(res);
        }
        case 'list':
        case 'getall': {
          const res = await this.svc.getAll();
          return Response.success(res);
        }
        case 'update': {
          const res = await this.svc.update();
          return Response.success(res);
        }
        case 'delete': {
          const res = await this.svc.remove();
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

module.exports = UserController;
