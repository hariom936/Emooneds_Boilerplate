/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { setupEnv } from '../src/config/setupEnv';

const action = process.argv;
async function main(arg) {
  // fetch and configure all env vars, including DB urls needed for this script to work on server
  await setupEnv();
  // Require config AFTER env is set
  const { default: dbConfig } = require('../src/config/database');
  const dbSettings = process.env.USE_TEST_DB ? dbConfig.test : dbConfig.primary;
  await mongoose.connect(dbSettings.url, dbSettings.options);
  console.log('DB Connected\n');

  const seedCommand = arg[2];
  const filesName = arg[3]?.split(',');
  const allSeedingFiles = fs.readdirSync(path.join(__dirname, '../', 'seeders'));
  let tempFiles: string[] = [];
  if (!filesName) {
    seeding(allSeedingFiles, seedCommand);
  } else {
    for (const file of filesName) {
      let indexVal = allSeedingFiles.findIndex(function (item) {
        return item.indexOf(file) !== -1;
      });
      tempFiles.push(allSeedingFiles[indexVal]);
    }
    seeding(tempFiles, seedCommand);
  }
}

async function seeding(fileNames, seedCommand = 'up') {
  for (const file of fileNames) {
    // import the seeder and trigger action
    const fileName = path.basename(file, '.js');
    const seeder = require(`../seeders/${fileName}`);
    await seeder[seedCommand]();
    console.log(`  ${file} \x1b[92m \u2714 \x1b[0m`);
  }
  console.log('Done!');
  process.exit(0);
}

main(action);
