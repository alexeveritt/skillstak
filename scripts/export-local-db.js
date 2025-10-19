// scripts/export-local-db.js
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const outDir = 'db-backups';
const outFile = `${outDir}/skillstak-db-${timestamp}.sql`;

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

execSync(`wrangler d1 export skillstak-db --local --output ${outFile}`, { stdio: 'inherit' });
console.log(`Exported to ${outFile}`);
