import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/Users';
import config from '../config/config';
import httpStatus from 'http-status';
import { ResponseService } from '../api/v1.0.0/services/ResponseService';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'before' })
export class UserSession implements ExpressMiddlewareInterface {
  constructor(private responseService: ResponseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtToken = req.headers?.authorization?.split(' ')[1]; // Extract Bearer token
      if (!jwtToken) {
        return this.responseService.validationError({
          res,
          status: httpStatus.UNAUTHORIZED,
          message: 'Authorization token missing',
        });
      }

      const decodedToken = jwt.verify(jwtToken, config.jwt.secret);
      if (typeof decodedToken === 'string' || !('userId' in decodedToken)) {
        return this.responseService.validationError({
          res,
          status: httpStatus.UNAUTHORIZED,
          message: 'Invalid token',
        });
      }
      const userId = (decodedToken as jwt.JwtPayload).userId;

      const userData = await UserModel.findById(userId);
      if (!userData || !userData.$session) {
        return this.responseService.validationError({
          res,
          status: httpStatus.UNAUTHORIZED,
          message: 'Invalid session or user not found',
        });
      }

      // Check if the session is expired
      const session = userData.$session();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isSessionExpired = Date.now() > ((session as unknown) as { expiresOn: number })?.expiresOn;
      if (isSessionExpired) {
        userData.$session(null);
        await userData.save();
        return this.responseService.validationError({
          res,
          status: httpStatus.UNAUTHORIZED,
          message: 'Session expired, please log in again',
        });
      }

      // Extend session expiry
      const currentSession = userData.$session();
      if (currentSession) {
        (currentSession as unknown as { expiresOn: number }).expiresOn = Date.now() + config.SESSION_EXPIRE_TIME * 60 * 1000;
        userData.$session(currentSession);
      }
      await userData.save();

      req.user = userData; // Attach user to the request for later use
      return next();
    } catch (error) {
      return this.responseService.validationError({
        res,
        status: httpStatus.UNAUTHORIZED,
        message: 'Invalid token or session',
      });
    }
  }
}
