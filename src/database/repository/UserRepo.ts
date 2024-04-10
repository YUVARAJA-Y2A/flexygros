import { PrismaClient } from '@prisma/client';
import { InternalError } from '../../core/ApiError';
import KeystoreRepo from './KeystoreRepo';
import User from '../model/User';
import Keystore from '../model/Keystore';

const prisma = new PrismaClient();

async function exists(id: number): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id, status: true },
  });
  return !!user;
}

async function findPrivateProfileById(id: number): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id, status: true },
    include: {
      roles: {
        where: { status: true },
        select: { code: true },
      },
    },
    select: { id: true, name: true, email: true, roles: true },
  });
}

async function findById(id: number): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id, status: true },
    include: {
      roles: {
        where: { status: true },
      },
    },
  });
}

async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: { email },
    include: {
      roles: {
        where: { status: true },
        select: { code: true },
      },
    },
  });
}

async function findFieldsById(
  id: number,
  fields: string[],
): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id, status: true },
    select: { ...fields.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}) },
  });
}

async function findPublicProfileById(id: number): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id, status: true },
  });
}

async function create(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
  roleCode: string,
): Promise<{ user: User; keystore: Keystore }> {
  const role = await prisma.role.findFirst({ where: { code: roleCode } });
  if (!role) throw new InternalError('Role must be defined');

  const createdUser = await prisma.user.create({
    data: {
      ...user,
      roles: {
        connect: { id: role.id },
      },
    },
  });

  const keystore = await KeystoreRepo.create(
    createdUser,
    accessTokenKey,
    refreshTokenKey,
  );

  return { user: createdUser, keystore };
}

async function update(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
): Promise<{ user: User; keystore: Keystore }> {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { ...user },
  });

  const keystore = await KeystoreRepo.create(
    updatedUser,
    accessTokenKey,
    refreshTokenKey,
  );

  return { user: updatedUser, keystore };
}

async function updateInfo(user: User): Promise<User> {
  return prisma.user.update({
    where: { id: user.id },
    data: { ...user },
  });
}

export default {
  exists,
  findPrivateProfileById,
  findById,
  findByEmail,
  findFieldsById,
  findPublicProfileById,
  create,
  update,
  updateInfo,
};
