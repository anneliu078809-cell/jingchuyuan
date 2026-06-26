# 靜初苑網站

Astro 靜態網站，部署到 Cloudflare Pages。

## 常用指令

```bash
npm install
npm run dev
npm run build
```

本機開發網址：

```text
http://127.0.0.1:4321/
```

## Cloudflare Pages

Build 設定：

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: /
```

Environment variable：

```text
NODE_VERSION=22
RESEND_API_KEY=你的 Resend API Key
CONTACT_TO_EMAIL=jingchuyuan1413@gmail.com
CONTACT_FROM_EMAIL=Jingchuyuan Website <noreply@jingchuyuan.com>
PUBLIC_TURNSTILE_SITE_KEY=Cloudflare Turnstile site key
TURNSTILE_SECRET_KEY=Cloudflare Turnstile secret key
CONTACT_ALLOWED_ORIGINS=https://jingchuyuan-1zx.pages.dev,https://jingchuyuan.com
```

目前網站提供 LINE / Instagram 與聯絡表單。表單會先經過 Cloudflare Pages Function 的來源檢查、欄位長度限制、Turnstile 驗證與簡單頻率限制，再透過 Resend 從 `noreply@jingchuyuan.com` 寄到 `CONTACT_TO_EMAIL` 指定的信箱。

`jingchuyuan.com` 必須先在 Resend 完成網域驗證，寄信功能才會成功。

`PUBLIC_TURNSTILE_SITE_KEY` 與 `TURNSTILE_SECRET_KEY` 必須一起設定後重新部署；只設定 secret 會讓前端沒有 Turnstile token，表單會送出失敗。
