
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'stefanus907',
          mode: 'insensitive' // I'll try this again without formatting it as a nested object if prisma 6.x allows
        }
      }
    });
    console.log('--- USERS START ---');
    users.forEach(u => {
      console.log(`ID: ${u.id}`);
      console.log(`Email: [${u.email}]`);
      console.log(`DeletedAt: ${u.deletedAt}`);
      console.log(`Status: ${u.deletedAt ? 'DELETED' : 'ACTIVE'}`);
      console.log('---');
    });
    console.log('--- USERS END ---');
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
