import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const programs = await prisma.program.findMany({
    take: 5,
    select: { id: true, code: true, name: true }
  });
  console.log('Programs Sample:', programs);
  
  const users = await prisma.user.findMany();
  console.log('Users count:', users.length);
}

check().catch(console.error).finally(() => prisma.$disconnect());
