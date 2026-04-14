import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const syllabusDir = path.join(__dirname, '../../node_scraper/syllabuses_js')
  const files = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.json'))

  console.log(`Found ${files.length} syllabus files. Starting seed...`)

  for (const file of files) {
    const rawData = fs.readFileSync(path.join(syllabusDir, file), 'utf8')
    const data = JSON.parse(rawData)

    console.log(`Processing ${data.program_name} (${data.program_code})...`)

    const program = await prisma.program.upsert({
      where: { code: data.program_code },
      update: {
        name: data.program_name,
        scheme: data.scheme,
      },
      create: {
        name: data.program_name,
        code: data.program_code,
        scheme: data.scheme,
      },
    })

    const semesterEntries = Object.entries(data.semesters)
    for (let i = 0; i < semesterEntries.length; i++) {
        const [semName, semSubjects] = semesterEntries[i] as [string, any[]]
        
        const semester = await prisma.syllabusSemester.create({
            data: {
                name: semName,
                number: i + 1,
                programId: program.id,
            }
        })

        for (const sub of semSubjects) {
            if (sub.isGroup) {
                await prisma.syllabusSubject.create({
                    data: {
                        code: sub.code || 'GROUP',
                        name: sub.name,
                        credits: sub.credits || 0,
                        category: sub.category,
                        semesterId: semester.id,
                        isGroup: true,
                        options: {
                            create: sub.options.map((opt: any) => ({
                                code: opt.code || '',
                                name: opt.name,
                                credits: typeof opt.credits === 'number' ? opt.credits : 0,
                                category: sub.category,
                                semesterId: semester.id,
                                isGroup: false
                            }))
                        }
                    }
                })
            } else {
                await prisma.syllabusSubject.create({
                    data: {
                        code: sub.code || '',
                        name: sub.name,
                        credits: typeof sub.credits === 'number' ? sub.credits : 0,
                        category: sub.category,
                        semesterId: semester.id,
                        isGroup: false
                    }
                })
            }
        }
    }
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
