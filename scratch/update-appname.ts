import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.configuration.upsert({
    where: { id: 'global' },
    update: { appName: 'PolyGrade' },
    create: { id: 'global', appName: 'PolyGrade', revision: 'Revision 2021' },
  });
  console.log('✓ Database appName updated to PolyGrade');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
