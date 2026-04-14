import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    const s = await p.syllabusSubject.findFirst({where:{code:'6000'}});
    console.log(s);
}
run().finally(() => p.$disconnect());
