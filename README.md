# SoJDev

Portfolio và blog kỹ thuật của **Lê Hoàng Lâm** (SoJDev), Fullstack Web Developer.

Site tĩnh build bằng [Astro](https://astro.build), nội dung viết bằng Markdown/MDX trong repo, deploy lên GitHub Pages qua GitHub Actions.

🌐 **Site:** [https://lhlam2515.github.io](https://lhlam2515.github.io)

## Stack

| Thành phần | Lựa chọn |
| --- | --- |
| Framework | Astro + TypeScript (SSG thuần, không có runtime server) |
| Nội dung | Markdown/MDX + content collections có schema |
| Tương tác | Astro island, chỉ khi cần |
| Hosting | GitHub Pages (user site) |
| CI/CD | GitHub Actions: `astro check` → build → deploy |

Lý do của từng lựa chọn nằm trong [docs/architecture.md](docs/architecture.md) (ADR-001 → ADR-006).

## Chạy local

Yêu cầu: Node.js 24 (trùng phiên bản Node mặc định của workflow deploy).

```bash
npm install
npm run dev       # dev server tại http://localhost:4321
npm run build     # astro check + build ra dist/
npm run preview   # xem bản build
```

## Cấu trúc thư mục

```text
├─ .github/workflows/deploy.yml
├─ docs/                   # tài liệu kiến trúc, ADR
├─ public/                 # CNAME, favicon, robots.txt, ảnh OG mặc định
├─ src/
│  ├─ content/
│  │  ├─ blog/vi/          # bài viết
│  │  └─ projects/vi/      # case study dự án
│  ├─ content.config.ts    # schema các collection
│  ├─ layouts/
│  ├─ components/
│  ├─ pages/
│  └─ styles/
└─ astro.config.mjs
```

## Viết nội dung

### Bài blog

Tạo file trong `src/content/blog/vi/`:

```md
---
title: "Kiến trúc JAMstack cho portfolio"
description: "Vì sao chọn SSG thuần trên GitHub Pages"
slug: kien-truc-jamstack
pubDate: 2026-09-27
tags: [architecture, astro]
draft: false
---
```

### Case study dự án

Tạo file trong `src/content/projects/vi/`. Mỗi case study đi theo cấu trúc **problem → decisions → outcome**, không phải danh sách tính năng. Các trường: `title`, `summary`, `role`, `stack`, `problem`, `decisions`, `outcome`, `repoUrl?`, `liveUrl?`, `featured`, `order`.

### Quy ước

- **Slug** là ASCII không dấu (`đ → d`), và không đổi sau khi đăng.
- **Frontmatter sai schema** làm build thất bại. Đây là chủ ý: lỗi phải bị bắt trước khi lên site.
- **Tiếng Việt** nằm ở URL gốc. Tiếng Anh sẽ thêm sau dưới `/en/` mà không đổi URL cũ.

## Deploy

Mỗi lần push lên `main` sẽ kích hoạt workflow `.github/workflows/deploy.yml`:

1. `actions/checkout@v7`
2. `withastro/action@v6`: cài dependencies, chạy `npm run build` (gồm `astro check`)
3. `actions/deploy-pages@v5`

Build lỗi thì không deploy. Có thể chạy tay từ tab **Actions** (`workflow_dispatch`).

## Tài liệu

- [Kiến trúc và ADR](docs/architecture.md)

## License

<!-- TODO: chọn license. Ví dụ: MIT cho code, CC BY 4.0 cho nội dung bài viết -->