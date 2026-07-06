import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

import app from './app.js';
import { connectDatabase } from './config/db.js';
import { seedDemoData } from './config/seed.js';

const port = Number(process.env.PORT || 8080);

async function start() {
  await connectDatabase();
  await seedDemoData();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Sport Portal API running on http://0.0.0.0:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});