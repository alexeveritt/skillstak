// scripts/migrate-prod.js
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import readline from 'node:readline';

const migrationFile = process.argv[2] || 'db/migration-add-project-color.sql';

if (!fs.existsSync(migrationFile)) {
  console.error(`Migration file not found: ${migrationFile}`);
  process.exit(1);
}

console.log(`Running migration: ${migrationFile}`);
console.log('Target: PRODUCTION D1 database (skillstak-db)');
console.log('\n⚠️  WARNING: This will modify your production database! ⚠️\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Type "yes" to continue: ', (answer) => {
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('Migration cancelled.');
    process.exit(0);
  }

  console.log('\nCreating backup first...');
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = 'db-backups';
    const backupFile = `${backupDir}/skillstak-db-prod-${timestamp}.sql`;

    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    execSync(`wrangler d1 export skillstak-db --remote --output ${backupFile}`, {
      stdio: 'inherit'
    });
    console.log(`✅ Backup saved to ${backupFile}`);
  } catch (error) {
    console.error('❌ Backup failed. Aborting migration.');
    process.exit(1);
  }

  console.log('\nRunning migration...');
  try {
    execSync(`wrangler d1 execute skillstak-db --remote --file=${migrationFile}`, {
      stdio: 'inherit'
    });
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('💡 You can restore from the backup if needed.');
    process.exit(1);
  }
});
// scripts/migrate-local.js
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const migrationFile = process.argv[2] || 'db/migration-add-project-color.sql';

if (!fs.existsSync(migrationFile)) {
  console.error(`Migration file not found: ${migrationFile}`);
  process.exit(1);
}

console.log(`Running migration: ${migrationFile}`);
console.log('Target: Local D1 database (skillstak-db-preview)');

try {
  execSync(`wrangler d1 execute skillstak-db-preview --local --file=${migrationFile}`, {
    stdio: 'inherit'
  });
  console.log('✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

