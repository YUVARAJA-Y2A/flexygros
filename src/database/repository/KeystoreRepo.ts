import { PrismaClient } from '@prisma/client';
import Keystore from '../model/Keystore';
import User from '../model/User';

const prisma = new PrismaClient();

async function findforKey(client: User, key: string): Promise<Keystore | null> {
  const keystore = await prisma.keystore.findFirst({
    where: {
      clientId: client.id,
      primaryKey: key,
      status: true,
    },
  });
  return keystore;
}

async function remove(id: number): Promise<Keystore | null> {
  const keystore = await prisma.keystore.delete({
    where: { id },
  });
  return keystore;
}

async function removeAllForClient(client: User): Promise<void> {
  await prisma.keystore.deleteMany({
    where: { clientId: client.id },
  });
}

async function find(
  client: User,
  primaryKey: string,
  secondaryKey: string,
): Promise<Keystore | null> {
  const keystore = await prisma.keystore.findFirst({
    where: {
      clientId: client.id,
      primaryKey,
      secondaryKey,
    },
  });
  return keystore;
}

async function create(
  client: User,
  primaryKey: string,
  secondaryKey: string,
): Promise<Keystore> {
  const keystore = await prisma.keystore.create({
    data: {
      client: { connect: { id: client.id } },
      primaryKey,
      secondaryKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return keystore;
}

export default {
  findforKey,
  remove,
  removeAllForClient,
  find,
  create,
};
