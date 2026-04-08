const { SqliteDatabase } = require('../Common.Services/dbHandler');

const TABLE = 'Users';

class UserService {
  constructor(message, dbPath) {
    this.msg = message;
    this.db = new SqliteDatabase(dbPath);
  }

  async create() {
    const body = this.msg.data || {};
    if (!this.msg.userPubKey) throw new Error('Missing user public key.');
    const now = new Date().toISOString();
    const row = {
      PubKey: this.msg.userPubKey.toLowerCase(),
      Name: body.name || null,
      Email: body.email || null,
      IsActive: 1,
      CreatedOn: now,
      UpdatedOn: now
    };
    this.db.open();
    try {
      const res = await this.db.insertValue(TABLE, row);
      return { id: res.lastId };
    } finally {
      this.db.close();
    }
  }

  async getById() {
    const id = this.msg.data && this.msg.data.id;
    if (!id) throw new Error('id is required');
    this.db.open();
    try {
      const u = await this.db.findById(TABLE, id);
      if (!u) return null;
      return this.#map(u);
    } finally {
      this.db.close();
    }
  }

  async getAll() {
    this.db.open();
    try {
      const rows = await this.db.getValues(TABLE, {});
      return rows.map(r => this.#map(r));
    } finally {
      this.db.close();
    }
  }

  async update() {
    const body = this.msg.data || {};
    const id = body.id;
    if (!id) throw new Error('id is required');
    this.db.open();
    try {
      const exists = await this.db.findById(TABLE, id);
      if (!exists) throw new Error('User not found');
      // Allow only owner (same pubkey) to update
      if (exists.PubKey.toLowerCase() !== (this.msg.userPubKey || '').toLowerCase()) {
        const err = new Error('Forbidden');
        err.code = 403; throw err;
      }
      const upd = {};
      if (body.name !== undefined) upd.Name = body.name;
      if (body.email !== undefined) upd.Email = body.email;
      if (body.isActive !== undefined) upd.IsActive = body.isActive ? 1 : 0;
      upd.UpdatedOn = new Date().toISOString();
      const res = await this.db.updateValue(TABLE, upd, { Id: id });
      return { changes: res.changes };
    } finally {
      this.db.close();
    }
  }

  async remove() {
    const id = this.msg.data && this.msg.data.id;
    if (!id) throw new Error('id is required');
    this.db.open();
    try {
      const exists = await this.db.findById(TABLE, id);
      if (!exists) return { changes: 0 };
      if (exists.PubKey.toLowerCase() !== (this.msg.userPubKey || '').toLowerCase()) {
        const err = new Error('Forbidden'); err.code = 403; throw err;
      }
      const res = await this.db.deleteValues(TABLE, { Id: id });
      return { changes: res.changes };
    } finally {
      this.db.close();
    }
  }

  #map(r) {
    return {
      id: r.Id,
      pubKey: r.PubKey,
      name: r.Name,
      email: r.Email,
      isActive: !!r.IsActive,
      createdOn: r.CreatedOn,
      updatedOn: r.UpdatedOn
    };
  }
}

module.exports = UserService;
