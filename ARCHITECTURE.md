# Architecture

## 目的

このドキュメントは、Express + TypeScript + Prisma 系の API サーバーを設計する際の基準を定義する  
特定の業務ドメインに依存しない汎用ルールとして書きつつ、このプロジェクトで採用している構成と責務分割をそのまま反映する

## 設計原則

- ファイル構造と URL 構造を一致させる
- 起動処理とアプリ設定を分離する
- route 固有処理は route に置く
- 複数 route で再利用する処理だけを共通層へ切り出す
- validation, error handling, DB, OpenAPI の責務境界を明確にする
- 外部公開契約と内部実装の対応関係を追いやすくする
- 変更時に見るべきファイル群を固定して保守性を上げる

## 全体構成

```text
src/
├─ app.ts
├─ index.ts
├─ configs/
├─ lib/
├─ middleware/
├─ routes/
├─ schemas/
├─ services/
├─ types/
└─ generated/
prisma/
├─ schema.prisma
└─ migrations/
openapi.yaml
```

## 起動境界

### `src/app.ts`

- Express アプリの構成だけを持つ
- middleware, router, error handler の組み立てを担当する
- listen はしない

### `src/index.ts`

- サーバー起動だけを持つ
- host, port, 起動ログを扱う
- アプリ設定と起動失敗時の責務を分離するため、設定コードは持ち込まない

## ルーティング設計

### 基本ルール

- `src/routes/` 配下の構造は URL に一致させる
- `index.ts` は Router 配線だけを書く
- `get.ts` / `post.ts` / `put.ts` / `delete.ts` / `patch.ts` に HTTP メソッド実装を書く
- 動的パラメータは `[paramName]/` で表現する
- 動的パラメータ配下の `index.ts` は `Router({ mergeParams: true })` を使う
- Router 変数名は `<pathName>Router` に統一する
- `*.controller.ts` のような suffix ベース構成は使わない

### 汎用例

```text
src/routes/
├─ index.ts
├─ fallback.ts
└─ v1/
   ├─ index.ts
   ├─ fallback.ts
   └─ resources/
      ├─ index.ts
      ├─ get.ts
      ├─ post.ts
      └─ [resourceId]/
         ├─ index.ts
         ├─ get.ts
         ├─ put.ts
         └─ delete.ts
```

### 汎用例の配線

```ts
import { Router } from 'express';
import { get } from './get';
import { post } from './post';
import resourceIdRouter from './[resourceId]';

const resourcesRouter = Router();

resourcesRouter.get('/', get);
resourcesRouter.post('/', post);
resourcesRouter.use('/:resourceId', resourceIdRouter);

export default resourcesRouter;
```

```ts
import { Router } from 'express';
import { get } from './get';
import { put } from './put';
import { del } from './delete';

const resourceIdRouter = Router({ mergeParams: true });

resourceIdRouter.get('/', get);
resourceIdRouter.put('/', put);
resourceIdRouter.delete('/', del);

export default resourceIdRouter;
```

## route 層の責務

route 層には、その URL でしか成立しない処理を置く

### route に置くもの

- request body / params / query の validation
- route 固有の分岐
- route 固有のレスポンス整形
- route 固有のエラーハンドリング文脈
- route 固有のログ文脈
- route 固有の stream 制御

### route に置かないもの

- 複数 route で再利用する変換処理
- 共通的な error shape の定義
- DB クライアント初期化
- logger インスタンス生成
- 運用で変わる共有設定値

## fallback 設計

fallback は route 木の末端ではなく、ルーティング境界ごとに置く

### 入口 fallback

- API の許可入口を制御する
- 例:
  - `/api` 以外は `FORBIDDEN`
  - `/v1` 以外は `FORBIDDEN`

### バージョン fallback

- API バージョン配下の未定義 route を `NOT_FOUND` に正規化する
- これにより 404 の責務を route 木の中で閉じられる

### このプロジェクトでの適用

- `src/routes/fallback.ts`
  - `/v1` 以外へのアクセスを `FORBIDDEN`
- `src/routes/v1/fallback.ts`
  - `/v1` 配下の未定義 route を `NOT_FOUND`

## エラーハンドリング設計

### 基本方針

- route では例外を投げる
- response shape の最終決定は error handler に集約する
- validation error と domain error と unexpected error を分ける
- status code と error code と message の揺れを防ぐ

### 構成

- `src/lib/apiError.ts`
  - `ErrorCode`
  - `ApiError`
  - `apiError`
- `src/middleware/errorHandler.ts`
  - `ApiError` を HTTP response に変換する
  - 予期しない例外を `500` に正規化する

### 汎用ルール

- validation failure は `400 + details`
- resource 不在は `404`
- 権限不足は `403`
- 想定外例外は詳細を漏らさず `500`
- route ごとに独自 error shape を返さない

### route での汎用例

```ts
import { Request, Response } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';
import { CreateResourceBodySchema } from '@/schemas/resource';

export const post = async (req: Request, res: Response): Promise<void> => {
  const validation = CreateResourceBodySchema.safeParse(req.body);

  if (!validation.success) {
    throw apiError(ErrorCode.VALIDATION_ERROR, validation.error.issues);
  }

  res.status(201).json({ ok: true });
};
```

## middleware 設計

middleware は request/response を横断して扱う処理だけを持つ

### この層に置くもの

- request logger
- response logger
- 共通 error handler
- 認証前段の共通処理
- 共通ヘッダ付与

### このプロジェクトでの適用

- `src/middleware/logger.ts`
  - request / response ログの一元化
- `src/middleware/errorHandler.ts`
  - 共通失敗出口

## lib 設計

`src/lib/` は複数 route で再利用する純粋な共通ロジック置き場として扱う

### 置いてよいもの

- API 共通エラー
- OpenAPI 互換変換
- message / input / output の共通正規化
- stream chunk 共通処理
- domain 横断ユーティリティ

### 置かないもの

- 1 route 専用の分岐
- 1 route 専用のレスポンス整形
- DB 接続や logger 生成のような外部依存初期化

### このプロジェクトでの適用

- `src/lib/apiError.ts`
  - API エラーの基盤
- `src/lib/utils.ts`
  - route 固有事情を持たない汎用関数

## config 設計

`src/configs/` は運用で変わりうる値を集約する

### ルール

- export 名は `SCREAMING_SNAKE_CASE`
- ローカル一時変数は置かない
- route 1 箇所だけで閉じる値は置かない
- 環境変数は型付きで解決する

### 置く対象

- CORS
- timeout
- retry
- chunk size
- stream interval
- 固定 instructions
- 外部 API の切り替え値

### このプロジェクトでの適用

- `src/configs/env.ts`
  - 現在は `.env` 入口
  - 今後は Zod で parse して型付き config に完成させる前提

## schema 設計

`src/schemas/` は再利用する Zod schema の定義置き場とする

### ルール

- validation の実行は route 側で `safeParse`
- schema 定義は共通化したい単位でまとめる
- response DTO ではなく request contract の表現を主目的にする
- Zod から型推論できる場合はその型を優先する

### このプロジェクトでの適用

- `src/schemas/user.ts`
  - create body
  - path params

## services 設計

`src/services/` は共有インスタンスや接続先初期化を集約する

### 置くもの

- logger
- Prisma client
- 外部 API client
- キャッシュ client

### ルール

- route からは service を利用するだけにする
- 初期化手順や接続切り替え点は service に閉じ込める
- 状態を持つサービスは singleton として扱う

### このプロジェクトでの適用

- `src/services/logger.ts`
  - `tslog` の singleton
- `src/services/prisma.ts`
  - `PrismaClient` の singleton
  - SQLite URL 正規化
  - DB adapter 切り替え点の集約

## types 設計

`src/types/` は必要になった時だけ追加する

### 置くもの

- Express 拡張型
- OpenAPI DTO と内部型の橋渡し型
- domain 横断の union 型
- branded type

### 置かないもの

- Zod からそのまま推論できる型の重複定義
- 単一ファイル内だけで閉じる補助型
- `any` を隠すための曖昧な型

### このプロジェクトでの適用

- 現在 `src/types/` は未作成
- 型は schema 推論と Prisma 型を優先している

## Prisma 設計

### 基本方針

- DB の正本は `prisma/schema.prisma`
- migration は `prisma/migrations/`
- route から直接 Prisma を new しない
- DB 切り替え点は service 層に集約する

### このプロジェクトでの適用

- datasource は SQLite
- generated client は `src/generated/prisma`
- route は `src/services/prisma.ts` 経由でのみ DB に触る
- `src/services/prisma.ts` に他 DB への切り替え例をコメントで保持する

### schema 変更時に同期するもの

- `prisma/schema.prisma`
- `src/schemas/`
- 対応 route
- `openapi.yaml`

## OpenAPI 設計

### 基本方針

- `openapi.yaml` を外部公開契約の正本として扱う
- request / response / status code は実装と必ず同期する
- validation error shape を共通化する
- API バージョン構造と `servers` / `paths` の整合を保つ

### このプロジェクトでの適用

- `servers` は `/v1` を基準にしている
- `paths` には `/users`, `/users/{userId}` などの公開 API を記述する
- `ApiErrorResponse` で validation error と通常 error を表現する

## ログ設計

### 基本方針

- `console.log` は使わない
- request / response ログは middleware に集約する
- 業務文脈ログは route または service から logger を使う

### このプロジェクトでの適用

- `src/services/logger.ts` に `tslog` を集約
- `src/middleware/logger.ts` で入口と出口のログを統一

## 環境変数設計

### 基本方針

- 環境変数はハードコードしない
- `.env.example` を用意する
- 最終的には Zod で parse して型付けする

### このプロジェクトでの適用

- `.env.example` に `HOST`, `PORT`, `CORS_POLICY_ORIGIN`, `DATABASE_URL` を保持
- `src/configs/env.ts` が参照入口になっている

## 開発時の同期観点

変更時は、責務ごとに見るべき場所を固定する

### route を追加した時

- `src/routes/...`
- 必要なら `src/schemas/...`
- 必要なら `src/lib/...`
- `openapi.yaml`

### request / response を変えた時

- 対応 route
- 対応 schema
- `src/lib/apiError.ts` が関係するならそこ
- `openapi.yaml`

### DB schema を変えた時

- `prisma/schema.prisma`
- migration
- `src/services/prisma.ts`
- 対応 route
- 対応 schema
- `openapi.yaml`

## 実装フロー

1. URL に合わせて `src/routes/...` を作る
2. `index.ts` で配線だけを書く
3. HTTP メソッドごとのファイルに route 固有処理を書く
4. request を `safeParse` で検証する
5. 共通 error は `apiError` 経由で投げる
6. 2 箇所以上で再利用が必要になった時点で `lib/`, `schemas/`, `services/`, `configs/`, `types/` に切り出す
7. Prisma と OpenAPI を同期する
8. `typecheck`, `lint`, `build` で確認する

## この設計で得たいこと

- route を見れば URL と振る舞いが追える
- error shape が全 API でそろう
- validation の位置がぶれない
- DB と API 契約の変更影響を追いやすい
- 小規模 API から中規模 API まで同じ原則で拡張できる
