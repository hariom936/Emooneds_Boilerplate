// import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
// import config from './config';


// const jwtVerify: VerifyCallback = async (payload, done) => {
//   try {
//     const exp: number = payload.exp * 1000; // jwt exp is in seconds since EPOCH, need to convert to ms
//     let tokenExpired = false;
//     if (exp <= Date.now()) {
//       tokenExpired = true;
//     }
//     done(null, { ...payload.sub, tokenExpired });
//   } catch (error) {
//     done(error, false);
//   }
// };

