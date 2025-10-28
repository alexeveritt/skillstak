// scripts/export-prod-db.js
import { execSync } from "node:child_process";
import fs from "node:fs";

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const outDir = "db-backups";
const outFile = `${outDir}/skillstak-db-prod-${timestamp}.sql`;

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

execSync(`wrangler d1 export skillstak-db --remote --output ${outFile}`, { stdio: "inherit" });
console.log(`Exported production database to ${outFile}`);
