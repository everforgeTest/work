const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  try {
    const txt = fs.readFileSync(envPath, 'utf8');
    txt.split('\
').forEach((l) => {
      const line = l.trim();
      if (!line || line.startsWith('#')) return;
      const eq = line.indexOf('=');
      if (eq <= 0) return;
      const key = line.substring(0, eq);
      const valRaw = line.substring(eq + 1);
      let val = valRaw;
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
  } catch (e) {
    // ignore missing .env
  }
}

loadEnv();

module.exports = {
  getMaintainerPubKey: () => (process.env.MAINTAINER_PUBKEY || '').toLowerCase()
};
