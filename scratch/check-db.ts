import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const programs = await prisma.program.findMany({
    include: {
      _count: {
        select: { semesters: true }
      }
    }
  });
  console.log(JSON.stringify(programs, null, 2));

  const sampleProgram = await prisma.program.findFirst({
    include: {
      semesters: {
        include: {
          subjects: true
        }
      }
    }
  });
  console.log('Sample Program Semesters Count:', sampleProgram?.semesters?.length);
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
