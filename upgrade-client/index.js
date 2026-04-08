const fs = require('fs');
const path = require('path');
const ContractService = require('./contract-service');

// Usage: node index.js wss://localhost:8081 ./dist.zip 1.1 "Description"
(async () => {
  try {
    const url = process.argv[2];
    const zipPath = process.argv[3];
    const version = parseFloat(process.argv[4]);
    const description = process.argv[5] || '';

    if (!url || !zipPath || isNaN(version)) {
      console.log('Usage: node index.js <contractUrl> <zipFilePath> <version> [description]');
      process.exit(1);
    }

    const abs = path.resolve(zipPath);
    const buf = fs.readFileSync(abs);

    const cs = new ContractService([url]);
    await cs.init();
    await cs.submitUpgrade(buf, version, description);
    console.log('Submitted upgrade request.');
  } catch (e) {
    console.error('Upgrade failed:', e);
    process.exit(1);
  }
})();
