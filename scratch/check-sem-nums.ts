import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sems = await prisma.syllabusSemester.findMany({
    take: 10,
    orderBy: { number: 'asc' },
    select: { name: true, number: true, program: { select: { name: true } } }
  });
  console.log(JSON.stringify(sems, null, 2));
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
