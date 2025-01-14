/* eslint-disable @typescript-eslint/no-var-requires */
import { setupEnv } from './src/config/setupEnv';
import mongoose from 'mongoose';
// bootstrap all mongoose models
require('./src/models/index');

async function start() {
  await setupEnv();

  // require our config & app AFTER env setup is done
  const { default: dbConfig } = require('./src/config/database');
  const { default: config } = require('./src/config/config');
  const { default: expressApp } = require('./src/app');

  const port = config.port;
  await mongoose.connect(dbConfig.primary.url, dbConfig.primary.options);
  console.log('DB Connected');
  expressApp.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    process.on('uncaughtException', (e) => {
      // log critical errors but prevent server from crashing
      console.error(e);
    });
  });
}

start();
