import 'reflect-metadata';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Container } from 'typedi';
import passport from 'passport';
import express, { Express, Application } from 'express';
import compression from 'compression';
import { useExpressServer, useContainer as routingUseContainer } from 'routing-controllers';
import swaggerUI from 'swagger-ui-express';
import swaggerDoc from './docs/swagger';
import path from 'path';
import config from './config/config';

import databaseConstants from './constants/databaseConstants';
import winston from 'winston';

const app: Express = express();
// set security HTTP headers
app.use(
  helmet({
    xssFilter: true,
    xPoweredBy: true,
    contentSecurityPolicy: {
      directives: config.contentSecurityDirectives
    }
  })
);

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.timestamp(), winston.format.json())
});
logger.add(new winston.transports.Console());
// parse json request body
app.use(express.json({ limit: databaseConstants.JSON_PAYLOAD_LIMIT }));
// parse text request body
app.use(express.text());
// parse req cookies
app.use(cookieParser());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
// request body compression
app.use(compression());
// enable cors
app.use(cors(config.corsOptions));


routingUseContainer(Container);

const expressApp: Application = useExpressServer(app, {
  cors: false,
  // classTransformer: true,
  // routePrefix: env.app.routePrefix,
  defaultErrorHandler: false,
  /**
   * We can add options about how routing-controllers should configure itself.
   * Here we specify what controllers should be registered in our express server.
   */
  controllers: [path.join(__dirname, '/api/v*/controllers/**/*Controller.[tj]s')],
  middlewares: [path.join(__dirname, '/middlewares/**/*Middleware.[tj]s')],
  interceptors: [path.join(__dirname, '/api/v*/interceptors/**/*Interceptor.[tj]s')],
 
});

// serve swagger ui
if (config.env !== 'production') {
  expressApp.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc, { explorer: true }));
}


export default expressApp;
