import { Request } from 'express';

/**
 * This is the decoded access token format fetched from cyberark auth provider
 */
export interface UserAccessToken {
  auth_time: number;
  iss: string;
  canRead: string;
  given_name: string;
  iat: number;
  Roles: string;
  aud: string;
  name: string;
  email: string;
  family_name: string;
  preferred_username: string;
  unique_name: string;
  exp: number;
  sub: string;
  group: string[];
  canWrite: string;
  scope: string;
  email_verified: boolean;
}

export interface UserJwtPayload {
  email: string;
  userId: string;
  roleId: string;
  userName: string;
  roleName: string;
  accessToken: string;
  refreshToken: string;
  isSystemUser?:boolean
}

export interface RequestWithUser extends Request {
  user?: UserJwtPayload;
}
