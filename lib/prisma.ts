import { PrismaClient } from './generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

try {
  prisma = global.prisma || new PrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }
} catch (error) {
  console.warn('Prisma client initialization failed, falling back to mock data:', error);
  // Create a mock Prisma client that throws errors to trigger fallbacks
  prisma = {} as PrismaClient;
}

export { prisma };
