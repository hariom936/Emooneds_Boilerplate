import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { ApiError } from '../utils/ApiError';
import { Service } from 'typedi';
import HttpStatus from 'http-status';
import { action, component, versions as api } from '../constants/api';
import { UserModel } from '../models/Users';

@Service()
export class AuthJwt implements ExpressMiddlewareInterface {
  private authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return new Promise((resolve) => {
      passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err || !user || info) {
          return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized access'));
        }

        // Allow expired token if it's a refresh token request
        if (user?.tokenExpired && req.originalUrl === `/${component.SESSION}/${api.ACTION}${action.REFRESH_TOKEN}`) {
          req.user = user;
          resolve();
        } else if (user?.tokenExpired) {
          return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Token expired'));
        } else {
          req.user = user;
          resolve();
        }
      })(req, res, next);
    });
  };

  public async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authenticate(req, res, next);
      const userInfo = req?.user as { sessionId: string };
      if (userInfo?.hasOwnProperty('isSystemUser') && userInfo['isSystemUser']) {
        return next();
      }
      const userData = await UserModel.findOne({
        'session.sessionId': userInfo['sessionId']
      });
      if (!userData) {
        return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized: Session not found'));
      }
      next();
    } catch (error) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized access'));
    }
  }
}
