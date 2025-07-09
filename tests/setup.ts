import { prisma } from '@/lib/prisma';
import { beforeEach, afterEach, afterAll } from '@jest/globals';

// Extend Jest global expect
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidJWT(): R;
    }
  }
}

// Custom JWT matcher
expect.extend({
  toHaveValidJWT(received: string) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    const pass = jwtRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT`,
        pass: false,
      };
    }
  },
});

// Clean up database before each test
beforeEach(async () => {
  const tablenames = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations';
  `;

  for (const { name } of tablenames) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${name}";`);
  }
});

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});