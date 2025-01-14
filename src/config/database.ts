export default {
  primary: {
    url: process.env.MONGO_URL as string,
    options: {
      dbName: process.env.MONGO_DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      minPoolSize: 10
    }
  }
};
