const Response = require('../Utils/Response.Helper');
const { ResponseCodes } = require('../Constants/constants');
const { SqliteDatabase } = require('../Services/Common.Services/dbHandler');
const settings = require('../settings.json').settings;

class ContractController {
  constructor(message) {
    this.msg = message;
    this.db = new SqliteDatabase(settings.dbPath);
  }

  async handle(ctx) {
    try {
      switch ((this.msg.Action || '').toLowerCase()) {
        case 'ping': {
          const info = await this.#info(ctx);
          return Response.success(info);
        }
        default:
          return Response.error(ResponseCodes.BAD_REQUEST, 'Unknown Action');
      }
    } catch (e) {
      const code = e.code || ResponseCodes.INTERNAL_ERROR;
      return Response.error(code, e.message || 'Error');
    }
  }

  async #info(ctx) {
    this.db.open();
    try {
      const last = await this.db.getLastRecord('ContractVersion');
      return {
        version: last ? last.Version : 0,
        lclSeqNo: ctx.lclSeqNo || null,
        timestamp: ctx.timestamp
      };
    } finally { this.db.close(); }
  }
}

module.exports = ContractController;
