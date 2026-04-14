import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const calculations = await prisma.calculation.findMany({
    include: {
      _count: {
        select: { semesters: true }
      }
    }
  });
  console.log(JSON.stringify(calculations, null, 2));
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
