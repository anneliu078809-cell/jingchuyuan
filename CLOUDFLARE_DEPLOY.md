# Cloudflare Pages 部署設定

這個專案是 Astro 靜態網站，部署到 Cloudflare Pages。

## Pages 設定

Cloudflare 後台請選：

```text
Workers & Pages
Create application
Pages
Import an existing Git repository
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
RESEND_API_KEY=你的 Resend API Key
CONTACT_TO_EMAIL=jingchuyuan1413@gmail.com
CONTACT_FROM_EMAIL=Jingchuyuan <noreply@jingchuyuan.com>
PUBLIC_TURNSTILE_SITE_KEY=Cloudflare Turnstile site key
TURNSTILE_SECRET_KEY=Cloudflare Turnstile secret key
CONTACT_ALLOWED_ORIGINS=https://jingchuyuan-1zx.pages.dev,https://jingchuyuan.com
```

## 本機驗證

```bash
npm install
npm run build
npm run dev
```

本機網址：

```text
http://127.0.0.1:4321/
```

## 聯絡表單

目前網站提供 LINE / Instagram 與聯絡表單。

表單欄位：

- 姓名或暱稱
- 聯絡方式
- 聯絡資料
- 想聊的方向

表單送出後會送到 `/api/contact`，由 Cloudflare Pages Function 透過 Resend 寄送到指定 Email 信箱，不需要同步到其他資料庫或外部表格。

Cloudflare 需要設定：

- `RESEND_API_KEY`：Resend 後台產生的 API Key。
- `CONTACT_TO_EMAIL`：收件信箱，目前是 `jingchuyuan1413@gmail.com`。
- `CONTACT_FROM_EMAIL`：寄件信箱，正式值為 `Jingchuyuan <noreply@jingchuyuan.com>`。`jingchuyuan.com` 必須先在 Resend 完成網域驗證。
- `PUBLIC_TURNSTILE_SITE_KEY`：Cloudflare Turnstile widget 的 site key。這是前端可公開值。
- `TURNSTILE_SECRET_KEY`：Cloudflare Turnstile widget 的 secret key。請用 Secret 類型保存。
- `CONTACT_ALLOWED_ORIGINS`：允許送出表單的網址，逗號分隔。未設定時會允許目前部署網址本身。

`PUBLIC_TURNSTILE_SITE_KEY` 與 `TURNSTILE_SECRET_KEY` 必須一起設定後重新部署。若只設定 `TURNSTILE_SECRET_KEY`，前端不會產生 Turnstile token，後端 log 會出現 `missing-turnstile-token`，表單會送出失敗。

正式上線建議在 Cloudflare WAF 另外加一條 rate limiting rule：限制 `/api/contact` 每個 IP 每 10 分鐘最多 3 到 5 次。
