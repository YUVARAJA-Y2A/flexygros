import { Tokens } from 'app-request';
import { AuthFailureError, InternalError } from '../core/ApiError';
import JWT, { JwtPayload } from '../core/JWT';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { tokenInfo } from '../config';

const prisma = new PrismaClient(); // Initialize PrismaClient

export const getAccessToken = (authorization?: string) => {
  if (!authorization) throw new AuthFailureError('Invalid Authorization');
  if (!authorization.startsWith('Bearer '))
    throw new AuthFailureError('Invalid Authorization');
  return authorization.split(' ')[1];
};

export const validateTokenData = (payload: JwtPayload): boolean => {
  if (
    !payload ||
    !payload.iss ||
    !payload.sub ||
    !payload.aud ||
    !payload.prm ||
    payload.iss !== tokenInfo.issuer ||
    payload.aud !== tokenInfo.audience ||
    !parseInt(payload.sub) // Assuming payload.sub is a string representation of an integer
  )
    throw new AuthFailureError('Invalid Access Token');
  return true;
};

export const createTokens = async (
  user: { id: string }, // Adjust the type to match the Prisma schema
  accessTokenKey: string,
  refreshTokenKey: string,
): Promise<Tokens> => {
  const accessTokenPayload: JwtPayload = {
    iss: tokenInfo.issuer,
    aud: tokenInfo.audience,
    sub: user.id,
    prm: accessTokenKey,
    exp: Math.floor(Date.now() / 1000) + tokenInfo.accessTokenValidity, // Expiry time in seconds
  };
  const accessToken = await JWT.encode(accessTokenPayload);

  if (!accessToken) throw new InternalError();

  const refreshTokenPayload: JwtPayload = {
    iss: tokenInfo.issuer,
    aud: tokenInfo.audience,
    sub: user.id,
    prm: refreshTokenKey,
    exp: Math.floor(Date.now() / 1000) + tokenInfo.refreshTokenValidity, // Expiry time in seconds
  };
  const refreshToken = await JWT.encode(refreshTokenPayload);

  if (!refreshToken) throw new InternalError();

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  } as Tokens;
};
