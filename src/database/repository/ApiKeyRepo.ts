import Logger from '../../core/Logger';
import { PrismaClient } from '@prisma/client';
import ApiKey from '../model/ApiKey';

const prisma = new PrismaClient();
// Function to find API key by key
async function findByKey(key: string): Promise<ApiKey | null> {
  try {
    // Use Prisma Client to query the database
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        key: key,
        status: true,
      },
    });

    return apiKey;
  } catch (error) {
    Logger.error('Error finding API key:', error);
    throw error;
  }
}

export default {
  findByKey,
};
