import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const normalizeSqliteUrl = (url: string): string => {
  if (url.startsWith('file:./') && !url.startsWith('file:./prisma/')) {
    return `file:./prisma/${url.slice('file:./'.length)}`;
  }

  return url;
};

// defaultでは sqlite
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: normalizeSqliteUrl(
      process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
    ),
  },
});
