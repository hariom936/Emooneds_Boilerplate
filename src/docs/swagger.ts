import config from '../config/config';
import * as responses from './components/responses.json';
import apiPaths from './paths';

import { schemas, securitySchemes } from './components/schemas.json';

const domain = config.swaggerDomain;
export default {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Emooneeds API',
    description: "This is a live documentation of the core CRM API's"
  },
  host: domain,
  servers: [
    {
      url: domain
    }
  ],
  paths: apiPaths,
  components: {
    schemas,
    responses,
    securitySchemes
  }
};
