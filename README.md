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
```

目前網站以 LINE / Instagram 作為主要聯絡入口。未來若新增表單，方向是一般聯絡表單，送出內容寄到指定 Email 信箱。
