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

目前網站提供 LINE / Instagram 與聯絡表單。表單送出內容會寄到指定 Email 信箱。
