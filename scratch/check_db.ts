import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('Users count:', users.length);
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));
  
  const programs = await prisma.program.findMany();
  console.log('Programs count:', programs.length);
  
  const calculations = await prisma.calculation.findMany();
  console.log('Calculations count:', calculations.length);
}

check().catch(console.error).finally(() => prisma.$disconnect());
