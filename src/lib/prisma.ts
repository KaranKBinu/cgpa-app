import { PrismaClient } from '@prisma/client';
import { createLogger } from './logger';

const log = createLogger('prisma');

const prismaClientSingleton = () => {
  log.info('Initialising Prisma client');
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
