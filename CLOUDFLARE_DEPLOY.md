# Cloudflare Pages 部署設定

這個專案目前是 Astro 靜態網站，不需要 Cloudflare Worker、Wrangler deploy、KV、D1 或 Pages Functions。

## 正確部署方式

Cloudflare 後台請用：

```text
Workers & Pages
Create application
Pages
Import an existing Git repository
```

選擇 GitHub repo：

```text
ivy081499/jingchuyuan
```

Build 設定：

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: /
```

Environment variables：

```text
NODE_VERSION=22
```

## 不要使用的設定

不要使用以下部署命令：

```text
npx wrangler versions upload
npx wrangler deploy
```

這些是 Worker 部署流程。此專案目前沒有後端 Worker，也不需要 `SESSION` KV namespace。

## 目前錯誤原因

如果部署 log 出現：

```text
Executing user deploy command: npx wrangler versions upload
[@astrojs/cloudflare] Enabling sessions with Cloudflare KV with the "SESSION" KV binding
Provisioning SESSION (KV Namespace)...
a namespace with this account ID and title already exists [code: 10014]
```

表示 Cloudflare 正在把專案當成 Worker / Cloudflare adapter 專案部署。

這不是目前網站需要的部署方式。請改用 Pages 靜態部署，讓 Cloudflare 只執行：

```text
npm run build
```

並直接上傳：

```text
dist
```

## 若已經建立錯誤專案

建議做法：

1. 刪除或停用目前失敗的 Worker-style project。
2. 回到 `Workers & Pages`。
3. 重新建立 `Pages` 專案。
4. 選 `Import an existing Git repository`。
5. 使用上面的 Build 設定。

如果後台有 `Deploy command` 欄位，請保持空白；不要填 `wrangler` 相關命令。

## `cloudflare/workers-autoconfig` 分支

Cloudflare 可能會自動建立遠端分支：

```text
origin/cloudflare/workers-autoconfig
```

目前已確認該分支包含 Worker 部署用的異動：

- `astro.config.mjs` 加入 `@astrojs/cloudflare` adapter
- `package.json` 加入 `@astrojs/cloudflare`、`wrangler`、`deploy`、`generate-types`
- `package-lock.json` 加入大量 Worker/Cloudflare adapter 依賴
- 新增 `wrangler.jsonc`
- 新增 `public/.assetsignore`
- `tsconfig.json` 加入 `worker-configuration.d.ts`
- `.gitignore` 加入 wrangler 相關忽略規則

這些異動不適合目前的純靜態 Astro Pages 網站。不要 merge 這個分支到 `main`。

目前正確的 `main` 應該保持：

```js
// astro.config.mjs
export default defineConfig({});
```

```json
// package.json
"dependencies": {
  "astro": "^6.4.2"
}
```

並且不需要：

```text
wrangler.jsonc
@astrojs/cloudflare
wrangler
public/.assetsignore
```

## 之後如果真的要表單後端

未來要做表單送出、LINE 通知時，再另外新增：

- Cloudflare Pages Functions 或 Workers
- Cloudflare Turnstile
- LINE Messaging API
- Google Sheet / Cloudflare D1 / KV

不要現在先啟用 Cloudflare adapter 或 KV，避免增加不必要的部署複雜度。
