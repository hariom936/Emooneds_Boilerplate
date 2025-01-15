const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT ?? 3000,
 
  corsOptions: {
    origin: (origin, callback) => {
      if (
        process.env.CORS_ORIGIN === '*' ||
        process.env.CORS_ORIGIN?.split(',').indexOf(origin) !== -1
      ) {
        callback(null, true);
      } else {
        callback(new Error());
      }
    },
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE'
  },
  swaggerDomain: process.env.SWAGGER_DOMAIN,
  // set the response headers config for helmet
  // ref https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
  contentSecurityDirectives: {
    defaultSrc: process.env.CORS_ORIGIN?.split(',') ?? "'self'",
    childSrc: ["'none'"],
    objectSrc: ["'none'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    imgSrc: ["'self'", "'unsafe-inline'"]
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '1d', // Adjust as needed
  },
  
  SESSION_EXPIRE_TIME: Number(process.env.SESSION_EXPIRE_TIME) || 10,
};

export default config;
