# Expressjs RESTful Template

TypeScript + Express 5 + Prisma 7 を使った API サーバーテンプレートです。  
デフォルトでは SQLite を使ってすぐに動かせる構成になっており、`src/services/prisma.ts` のコメント例を使って PostgreSQL / MySQL / SQL Server / Turso(libSQL) へ切り替えられます。

## 主な構成

- Express `5.2.x`
- TypeScript `5.9.x`
- Prisma ORM `7.5.x`
- Prisma Adapter `@prisma/adapter-better-sqlite3`
- ESLint `9`
- Prettier `3`

## できること

- Express 5 ベースの API サーバー開発
- TypeScript による型安全な実装
- Prisma 7 による DB 操作
- SQLite ですぐ始められるローカル開発
- DB アダプタを差し替えた他 DB への展開
- `tsx` による開発時の自動再起動

## ディレクトリ概要

```text
.
├─ prisma/
│  ├─ migrations/
│  └─ schema.prisma
├─ src/
│  ├─ configs/
│  ├─ middleware/
│  ├─ routes/
│  │  └─ v1/
│  │     ├─ test/
│  │     └─ users/
│  │        └─ [userId]/
│  ├─ services/
│  │  ├─ logger.ts
│  │  └─ prisma.ts
│  └─ index.ts
├─ prisma.config.ts
├─ package.json
└─ tsconfig.json
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数ファイルの作成

macOS / Linux:

```bash
cp .env.example .env
```

### 3. Prisma の初期セットアップ

```bash
npm run prisma-setup
```

このコマンドで次の処理を行います。

- `prisma db push`
- `prisma generate`

### 4. 開発サーバー起動

```bash
npm run dev
```

起動後のデフォルト URL:

- `http://0.0.0.0:3000`
- 実運用上のアクセス例: `http://localhost:3000`

## 利用可能な npm scripts

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Prisma Client 生成後、`tsx watch` で開発サーバーを起動 |
| `npm run prisma:generate` | Prisma Client を再生成 |
| `npm run prisma:seed` | Prisma Client を再生成して seed を実行 |
| `npm run prisma-setup` | `db push` と `generate` をまとめて実行 |
| `npm run typecheck` | Prisma Client 再生成後に TypeScript 型チェック |
| `npm run lint` | `src` と `prisma` 配下を ESLint で検査 |
| `npm run lint:fix` | ESLint の自動修正 |
| `npm run build` | Prisma Client 再生成後に `dist/` へビルド |
| `npm run start` | ビルド済みの `dist/index.js` を起動 |
| `npm run test` | `build` 実行後に `start` |

## API エンドポイント例

### ヘルスチェック用

```http
GET /v1/test
```

レスポンス例:

```json
{
  "message": "Hello from /v1/test!"
}
```

### ユーザー作成

```http
POST /v1/users
Content-Type: application/json
```

```json
{
  "name": "Taro"
}
```

### ユーザー一覧取得

```http
GET /v1/users
```

### ユーザー単体取得

```http
GET /v1/users/:userId
```

実装上は `src/routes/v1/users/[userId]/` 配下に分けてあり、単体取得系の処理を階層化しやすい構成にしています。

## Prisma の構成

- Prisma schema は `prisma/schema.prisma`
- Prisma config は `prisma.config.ts`
- 生成先は `src/generated/prisma-client`
- 現在の datasource は SQLite
- デフォルトの DB パスは `file:./prisma/dev.db`

`src/services/prisma.ts` では `@prisma/adapter-better-sqlite3` を使っています。  
また、同ファイル内に以下 DB 向けの切り替え例をコメントで用意しています。

- PostgreSQL
- MySQL / MariaDB
- SQL Server
- Turso / libSQL

他 DB に切り替えるときは、`src/services/prisma.ts` のコメント例とあわせて次の 3 ファイルを変更してください。

- `src/services/prisma.ts`
- `prisma/schema.prisma`
- `prisma.config.ts`

## Seed の例

サンプル seed は `prisma/seed.ts` に入っています。  
デフォルトでは `User` テーブルにサンプルユーザーを 2 件投入します。

この seed は次のような挙動です。

- `User` が 1 件もないときだけサンプルデータを作成
- すでにデータがある場合は上書きせずにスキップ
- 現在の SQLite + Prisma Adapter 構成でそのまま実行可能

必要に応じて `prisma/seed.ts` を編集し、初期データの内容をプロジェクト向けに変更してください。

## Prisma の運用コマンド例

### Prisma Client の再生成

```bash
npm run prisma:generate
```

### スキーマを DB に反映

```bash
npm run prisma-setup
```

または個別に:

```bash
npx prisma db push
npx prisma generate
```

### seed の実行

```bash
npm run prisma:seed
```

または Prisma CLI から直接:

```bash
npx prisma db seed
```

### マイグレーションを作成しながら反映

```bash
npx prisma migrate dev --name init
```

変更内容に応じて `init` 部分は任意の名前にしてください。

### 本番環境でマイグレーションを適用

```bash
npx prisma migrate deploy
```

### Prisma Studio を開く

```bash
npx prisma studio
```

### スキーマの検証

```bash
npx prisma validate
```

### スキーマの整形

```bash
npx prisma format
```

### DB をリセットして作り直す

```bash
npx prisma migrate reset
```

このコマンドはデータを削除するため、開発時のみ利用してください。

## Docker で起動する場合

```bash
docker compose up -d
```

`docker-compose.yaml` には Node コンテナでの起動例を入れています。  
必要に応じてポートやコマンドはプロジェクトに合わせて調整してください。

## 補足

- `src/services/logger.ts` に `tslog` ベースの logger を配置しています
- `src/middleware/logger.ts` でリクエストログを出しています
- CORS は `.env` の `CORS_POLICY_ORIGIN` を参照します
- Prisma 7 の都合で、ビルドや型チェックの前に Prisma Client を自動生成しています
