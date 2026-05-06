# AGENTS.md

## このリポジトリで最初に守ること

- `ARCHITECTURE.md` を参照してから構成変更を行う
- 既存機能を変えずに責務整理する時は route 構造とエラーレスポンス shape を優先して守る
- `index.ts` に実装を書かず Router 配線だけにする
- route 固有処理を安易に `lib/` へ移さない

## ルーティング規約

- `src/routes/` 配下の構造は URL に一致させる
- `index.ts` は Router 配線のみ
- `get.ts` / `post.ts` / `put.ts` / `delete.ts` / `patch.ts` に HTTP メソッド実装を書く
- 動的パラメータは `[paramName]/`
- 動的パラメータ配下の `index.ts` は `Router({ mergeParams: true })`
- Router 変数名は `<pathName>Router`
- route 固有の validation, response 整形, 分岐, エラー文脈, ログ文脈は route に置く

## fallback / error handling 規約

- `/v1` 以外は `src/routes/fallback.ts` で `FORBIDDEN`
- `/v1` 配下の未定義 route は `src/routes/v1/fallback.ts` で `NOT_FOUND`
- validation は `safeParse` を使い、失敗時は `400 + details`
- route では `apiError(...)` を投げ、最終的なレスポンス化は `src/middleware/errorHandler.ts` に任せる
- 想定外例外の response shape を route ごとにばらけさせない

## ディレクトリ責務

- `src/configs/`
  - 運用で変わるグローバル定数を置く
  - グローバル定数値の export 名は `SCREAMING_SNAKE_CASE`
- `src/lib/`
  - 複数 route で再利用する共通ロジックだけを置く
- `src/middleware/`
  - request/response の横断処理を置く
- `src/schemas/`
  - 再利用する Zod schema 定義を置く
- `src/services/`
  - logger や Prisma などの共有インスタンスを置く
- `src/types/`
  - 必要になった時だけ追加する
  - Express 拡張や共通 DTO 型に限定する
- `prisma/`
  - DB schema と migration の正本
- `openapi.yaml`
  - API 契約の正本

## 実装ルール

- TypeScript は `strict: true`
- `any` は使わない
- 非同期処理は `async/await`
- `console.log` は使わず `src/services/logger.ts` を使う
- 相対パスの多用は避けて `@/` を優先する
- コメントは日本語で、なぜその形にするかを書く
- route 1 箇所でしか使わない処理はその route に残す
- 共通化は 2 箇所以上で必要になってから検討する

## Prisma / OpenAPI 同期

- Prisma schema を変えたら route, schema, OpenAPI も見る
- request / response を変えたら `openapi.yaml` を同時更新する
- DB 変更後は `prisma generate` 前提の script が壊れないか確認する

## 変更後チェック

- `npm run typecheck`
- `npm run lint`
- `npm run build`

ドキュメント変更だけでも、関連する設計説明が `ARCHITECTURE.md` と矛盾していないか確認する
