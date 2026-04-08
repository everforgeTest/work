const fs = require('fs');
try {
  if (fs.existsSync('evernode_portal.db')) fs.unlinkSync('evernode_portal.db');
  console.log('Database removed');
} catch (e) { console.error(e); }
