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

Yêu cầu: Node.js 22.12 trở lên (theo `engines` trong `package.json`) và pnpm 12 (workflow deploy dùng `pnpm@12.6.0`).

```bash
pnpm install
pnpm dev          # dev server tại http://localhost:4321
pnpm build        # astro check → build ra dist/ → kiểm tra link nội bộ
pnpm preview      # xem bản build
```

Build cục bộ không cần biến môi trường: không có `SITE_URL` thì `site` là `http://localhost:4321`. Ở CI, `SITE_URL` lấy từ Settings → Pages.

## Cấu trúc thư mục

```text
├─ .github/workflows/deploy.yml
├─ docs/                   # kiến trúc (ADR), kiến trúc thông tin (IA), responsive (RD)
├─ public/                 # favicon
├─ src/
│  ├─ assets/              # font tự host, ảnh chân dung
│  ├─ content/
│  │  ├─ blog/vi/          # bài viết
│  │  ├─ projects/vi/      # case study dự án
│  │  └─ tags/tags.yaml    # từ vựng tag
│  ├─ content.config.ts    # schema các collection
│  ├─ lib/                 # truy vấn nội dung, slug, thông tin site
│  ├─ integrations/        # check-links.ts: kiểm link nội bộ sau build
│  ├─ layouts/             # Base, Post, Project
│  ├─ components/
│  ├─ pages/
│  └─ styles/              # tokens.css (sinh từ design system), global.css
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
relatedProjects: [sojdev-site]   # tuỳ chọn
draft: false
---
```

`tags` gồm 1–4 tag, và mỗi tag phải được khai báo trước trong `src/content/tags/tags.yaml`. Tag mới thì thêm vào đó trước, rồi mới gắn vào bài. `relatedProjects` trỏ tới `slug` của case study; trang dự án tự liệt kê các bài trỏ về nó.

### Case study dự án

Tạo file trong `src/content/projects/vi/`. Mỗi case study đi theo cấu trúc **problem → decisions → outcome**, không phải danh sách tính năng. Các trường: `title`, `summary`, `slug`, `role`, `stack`, `problem`, `decisions` (mỗi mục có `title` và `rationale`), `outcome`, `updatedDate?`, `repoUrl?`, `liveUrl?`, `featured`, `order`.

Frontmatter là overview, thân bài là bằng chứng: 2–4 quyết định, mỗi trường có giới hạn độ dài, và thân bài có một mục `##` cho mỗi quyết định, trùng tên và thứ tự với `decisions[].title`. Chi tiết và cách viết từng phần ở IA-007 trong [docs/content-system.md](./docs/content-system.md); bài mẫu là `sojdev-site.md`.

### Quy ước

- **Slug** là ASCII không dấu (`đ → d`), không trùng trong cùng collection, và không đổi sau khi đăng. Tạo từ tiêu đề bằng `slugify()` trong `src/lib/slug.ts`.
- **Frontmatter sai schema** làm build thất bại. Đây là chủ ý: lỗi phải bị bắt trước khi lên site.
- **Tiếng Việt** nằm ở URL gốc. Tiếng Anh sẽ thêm sau dưới `/en/` mà không đổi URL cũ.

## Deploy

Mỗi lần push lên `main` sẽ kích hoạt workflow `.github/workflows/deploy.yml`:

1. `actions/checkout@v7`
2. `actions/configure-pages@v6`: lấy origin của site (github.io hoặc custom domain) làm `SITE_URL`
3. `withastro/action@v6`: cài dependencies bằng pnpm, chạy `pnpm build` (gồm `astro check` và kiểm tra link)
4. `actions/deploy-pages@v5`

Build lỗi thì không deploy. Có thể chạy tay từ tab **Actions** (`workflow_dispatch`).

## Tài liệu

- [Kiến trúc và ADR](docs/architecture.md)
- [Kiến trúc thông tin: trang, URL, phân loại](docs/content-system.md)
- [Nguyên tắc responsive](docs/responsive.md)
- [Hướng dẫn cho AI agent](AGENTS.md) (`CLAUDE.md` là symlink tới file này)

## License

<!-- TODO: chọn license. Ví dụ: MIT cho code, CC BY 4.0 cho nội dung bài viết -->