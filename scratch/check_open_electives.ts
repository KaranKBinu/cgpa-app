import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const openElectives = await prisma.syllabusSubject.findMany({
    where: { category: 'Open Elective course' },
    select: {
      code: true,
      name: true,
      semester: {
        include: {
          program: { select: { name: true, code: true } }
        }
      }
    }
  })

  console.log(`Total Open Elective Subjects Found: ${openElectives.length}`)
  
  // Show first 10
  openElectives.slice(0, 10).forEach(oe => {
    console.log(`- [${oe.code}] ${oe.name} (from ${oe.semester.program.name})`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
