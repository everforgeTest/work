const fs = require('fs');
const { SqliteDatabase } = require('./dbHandler');

class UpgradeService {
  constructor(message, dbPath, settings) {
    this.msg = message;
    this.db = new SqliteDatabase(dbPath);
    this.settings = settings;
  }

  async upgrade() {
    const zipData = this.msg.data;
    if (!zipData || typeof zipData.version !== 'number' || !zipData.content) {
      const e = new Error('Invalid payload'); e.code = 400; throw e;
    }

    this.db.open();
    try {
      const last = await this.db.getLastRecord('ContractVersion');
      const currentVer = last ? parseFloat(last.Version) : 0.0;
      if (zipData.version <= currentVer) {
        const e = new Error('Version must be greater than current'); e.code = 403; throw e;
      }

      // Persist zip to file for post_exec.sh to extract.
      const buf = Buffer.isBuffer(zipData.content) ? zipData.content : Buffer.from(zipData.content.buffer || zipData.content);
      fs.writeFileSync(this.settings.newContractZipFileName, buf);

      const script = `#!/bin/bash\
\
! command -v unzip &>/dev/null && apt-get update && apt-get install --no-install-recommends -y unzip\
\
zip_file=\"${this.settings.newContractZipFileName}\"\
unzip -o -d ./ \"$zip_file\" >>/dev/null\
rm \"$zip_file\" >>/dev/null\
`;
      fs.writeFileSync(this.settings.postExecutionScriptName, script);
      fs.chmodSync(this.settings.postExecutionScriptName, 0o777);

      const now = Date.now();
      await this.db.insertValue('ContractVersion', {
        Version: zipData.version,
        Description: zipData.description || null,
        CreatedOn: now,
        LastUpdatedOn: now
      });
      return { message: 'Contract upgraded', version: zipData.version };
    } finally {
      this.db.close();
    }
  }
}

module.exports = UpgradeService;
