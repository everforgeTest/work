class AuthService {
  constructor(message, dbPath) {
    this.msg = message;
    this.dbPath = dbPath;
  }

  async me() {
    return {
      pubKey: this.msg.userPubKey || null
    };
  }
}

module.exports = AuthService;
