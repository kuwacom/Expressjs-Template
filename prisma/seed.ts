import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma-client/client';

const normalizeSqliteUrl = (url: string): string => {
  if (url.startsWith('file:./') && !url.startsWith('file:./prisma/')) {
    return `file:./prisma/${url.slice('file:./'.length)}`;
  }

  return url;
};

const adapter = new PrismaBetterSqlite3(
  {
    url: normalizeSqliteUrl(process.env.DATABASE_URL ?? 'file:./prisma/dev.db'),
  },
  {
    // 以前の Prisma SQLite ドライバで作成した DB との互換性を維持
    timestampFormat: 'unixepoch-ms',
  }
);

const prisma = new PrismaClient({ adapter });

async function main() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log(`Seed skipped: users already exist (${userCount} records).`);
    return;
  }

  const users = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: 'Template User 1',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Template User 2',
      },
    }),
  ]);

  console.log('Seed completed.');
  console.log(users);
}

main()
  .catch(async (error) => {
    console.error('Seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
