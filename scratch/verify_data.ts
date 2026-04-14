import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const programs = await prisma.program.findMany()
  console.log(`Total Programs: ${programs.length}`)
  
  const cm = await prisma.program.findUnique({
    where: { code: 'CM' },
    include: {
      semesters: {
        include: {
          _count: { select: { subjects: true } },
          subjects: {
            where: { isGroup: true },
            include: { _count: { select: { options: true } } }
          }
        }
      }
    }
  })

  if (cm) {
    console.log(`\nVerification for CM:`)
    cm.semesters.forEach(sem => {
      console.log(`- ${sem.name}: ${sem._count.subjects} top-level/nested subjects`)
      sem.subjects.forEach(sub => {
        if (sub.isGroup) console.log(`  * Group "${sub.name}" has ${sub._count.options} options`)
      })
    })

    const internship6 = await prisma.syllabusSubject.findFirst({
        where: { code: '6007', semester: { program: { code: 'CM' } } }
    })
    console.log(`\nInternship (6007) credits: ${internship6?.credits} (Expected: 13.5)`)

    const physicsLab = await prisma.syllabusSubject.findFirst({
        where: { code: '2006', semester: { name: 'Semester I', program: { code: 'CM' } } }
    })
    console.log(`Applied Physics Lab (S1) credits: ${physicsLab?.credits} (Expected: 0)`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
