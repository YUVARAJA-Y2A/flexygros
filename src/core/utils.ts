import { PrismaClient } from '@prisma/client';

export const enum Header {
  API_KEY = 'x-api-key',
  AUTHORIZATION = 'authorization',
}

export const prisma = new PrismaClient();
