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

表單送出後會寄送到指定 Email 信箱，不需要同步到其他資料庫或外部表格。
