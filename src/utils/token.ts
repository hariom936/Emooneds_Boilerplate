import jwt from 'jsonwebtoken';
import config from '../config/config';
import moment from 'moment';

/**
 *
 * @param {object} subject - The jwt sybject
 * @param {string} expiresIn - iat to be set. Eg: 30m
 * @returns {string} The signed jwt
 */
const generateJwtToken = (subject: object, expiresIn) => {
  const jwtData = {
    sub: subject,
    iat: moment().unix(),
    exp: expiresIn
  };
  return jwt.sign(jwtData, config.jwt.secret);
};

export { generateJwtToken };
