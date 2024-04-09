const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create API keys
    await prisma.apiKey.create({
      data: {
        key: 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj',
        permissions: ['GENERAL'],
        comments: ['To be used by the xyz vendor'],
        version: 1,
        status: true,
      },
    });

    // Create roles
    await prisma.role.createMany({
      data: [
        { code: 'SUPER_USER', status: true },
        { code: 'ADMIN', status: true },
        { code: 'EDITOR', status: true },
        { code: 'ADMIN', status: true },
      ],
    });

    // Create a user
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@xyz.com',
        password:
          '$2a$10$psWmSrmtyZYvtIt/FuJL1OLqsK3iR1fZz5.wUYFuSNkkt.EOX9mLa', // hash of password: changeit
        roles: {
          connect: [
            { code: 'LEARNER' },
            { code: 'WRITER' },
            { code: 'EDITOR' },
            { code: 'ADMIN' },
          ],
        },
        status: true,
      },
    });

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
