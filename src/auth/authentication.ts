import express from 'express';
import { ProtectedRequest } from 'app-request';
import {
  AuthFailureError,
  AccessTokenError,
  TokenExpiredError,
} from '../core/ApiError';
import JWT from '../core/JWT';
import { getAccessToken, validateTokenData } from './authUtils';
import validator, { ValidationSource } from '../helper/validator';
import schema from './schema';
import asyncHandler from '../helper/asyncHandler';
import { prisma } from '../core/utils';

const router = express.Router();

export default router.use(
  validator(schema.auth, ValidationSource.HEADER),
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    req.accessToken = getAccessToken(req.headers.authorization);

    try {
      const payload = await JWT.validate(req.accessToken);
      validateTokenData(payload);

      // Find user by ID using Prisma
      const user = await prisma.user.findUnique({
        where: { id: parseInt(payload.sub) }, // Assuming ID is stored as integer
      });
      if (!user) throw new AuthFailureError('User not registered');
      req.user = user;

      // Find keystore using Prisma
      const keystore = await prisma.keystore.findFirst({
        where: {
          userId: user.id,
          key: payload.prm,
        },
      });
      if (!keystore) throw new AuthFailureError('Invalid access token');
      req.keystore = keystore;

      return next();
    } catch (e) {
      if (e instanceof TokenExpiredError) throw new AccessTokenError(e.message);
      throw e;
    }
  }),
);
