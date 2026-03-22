import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import env from '@/configs/env';
import { PrismaClient } from '@/generated/prisma/client';

/*
DB アダプタの切り替え手順:

1. 利用したい DB 用のアダプタパッケージをインストールする
2. `prisma/schema.prisma` の datasource `provider` を変更する
3. `prisma.config.ts` の datasource URL と必要な env を変更する
4. 下の対応する import / 実装例のコメントを外し、`adapter` を差し替える

Prisma 公式アダプタ:
- PostgreSQL: @prisma/adapter-pg
- MySQL / MariaDB: @prisma/adapter-mariadb
- SQL Server: @prisma/adapter-mssql
- SQLite (ローカル): @prisma/adapter-better-sqlite3
- SQLite / Turso (libSQL): @prisma/adapter-libsql
*/

/*
// PostgreSQL
// npm install @prisma/adapter-pg pg
// prisma/schema.prisma -> provider = "postgresql"
// prisma.config.ts -> datasource.url = process.env.DATABASE_URL
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL as string,
});
*/

/*
// MySQL / MariaDB
// npm install @prisma/adapter-mariadb mariadb
// prisma/schema.prisma -> provider = "mysql"
// prisma.config.ts -> datasource.url = process.env.DATABASE_URL
// 必要な env の例:
// DB_HOST=127.0.0.1
// DB_PORT=3306
// DB_USER=root
// DB_PASSWORD=secret
// DB_NAME=app
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: env.DB_HOST as string,
  port: Number(env.DB_PORT ?? 3306),
  user: env.DB_USER as string,
  password: env.DB_PASSWORD as string,
  database: env.DB_NAME as string,
  connectionLimit: Number(env.DB_CONNECTION_LIMIT ?? 5),
});
*/

/*
// SQL Server
// npm install @prisma/adapter-mssql mssql
// prisma/schema.prisma -> provider = "sqlserver"
// prisma.config.ts -> datasource.url = process.env.DATABASE_URL
// 必要な env の例:
// DB_HOST=127.0.0.1
// DB_PORT=1433
// DB_USER=sa
// DB_PASSWORD=yourStrong(!)Password
// DB_NAME=app
import { PrismaMssql } from '@prisma/adapter-mssql';

const adapter = new PrismaMssql({
  server: env.DB_HOST as string,
  port: Number(env.DB_PORT ?? 1433),
  user: env.DB_USER as string,
  password: env.DB_PASSWORD as string,
  database: env.DB_NAME as string,
  options: {
    encrypt: env.DB_ENCRYPT === 'true',
    trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
  },
});
*/

/*
// Turso / libSQL
// npm install @prisma/adapter-libsql
// prisma/schema.prisma -> provider = "sqlite"
// prisma.config.ts -> datasource.url = process.env.DATABASE_URL
// 必要な env の例:
// DATABASE_URL=libsql://your-database.turso.io
// TURSO_AUTH_TOKEN=...
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: env.DATABASE_URL as string,
  authToken: env.TURSO_AUTH_TOKEN,
});
*/

const normalizeSqliteUrl = (url: string): string => {
  if (url.startsWith('file:./') && !url.startsWith('file:./prisma/')) {
    return `file:./prisma/${url.slice('file:./'.length)}`;
  }

  return url;
};

const adapter = new PrismaBetterSqlite3(
  {
    url: normalizeSqliteUrl(env.DATABASE_URL ?? 'file:./prisma/dev.db'),
  },
  {
    // 以前の Prisma SQLite ドライバで作成した DB との互換性を維持
    timestampFormat: 'unixepoch-ms',
  }
);

const prisma = new PrismaClient({ adapter });

export default prisma;
