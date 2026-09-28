# SoJDev site

Portfolio và blog kỹ thuật của Lê Hoàng Lâm: site tĩnh Astro 7, nội dung Markdown/MDX trong repo, deploy lên GitHub Pages. Không có runtime server, không có JavaScript phía client.

Mọi quyết định đã chốt đều có mã và nằm trong `docs/`. Đọc file tương ứng trước khi đổi phần liên quan:

| Mã | File | Phạm vi |
| --- | --- | --- |
| ADR-001 → ADR-006 | `docs/architecture.md` | SSG, Astro, nội dung trong repo, hosting/CI, tiếng Việt ở gốc |
| IA-001 → IA-006 | `docs/content-system.md` | URL, tag, liên kết bài ↔ dự án, điều hướng, trang danh sách, trang chủ, metadata |
| RD-001 → RD-007 | `docs/responsive.md` | Breakpoint, lưới, cỡ chữ, ảnh, container query |

Mỗi file có mục **Stop rules**: những gì không được thêm vào. Muốn làm ngược một stop rule thì hỏi trước, đừng tự làm.

## Lệnh

Dùng **pnpm** (CI chạy `pnpm@12.6.0`). `astro` không nằm trên PATH, luôn gọi qua `pnpm`.

```zsh
pnpm install
pnpm astro dev --background   # dev server tại http://localhost:4321
pnpm astro dev status         # cũng có: stop, logs
pnpm build                    # astro check → astro build → kiểm tra link nội bộ (~10 giây)
pnpm preview
```

`pnpm build` là quality gate của CI: build lỗi thì không deploy. Chạy nó trước khi báo xong mọi thay đổi trong `src/`.

## Cấu trúc cần biết

- `src/content.config.ts`: schema ba collection `blog`, `projects`, `tags`, và `slugId()` (chặn slug trùng).
- `src/lib/content.ts`: mọi truy vấn nội dung và hàm dựng URL. `assertReferences()` kiểm tag và `relatedProjects`.
- `src/lib/slug.ts`: `slugify()`, `SLUG_PATTERN`, `slugSchema`.
- `src/lib/site.ts`: tên site, tagline, kênh liên hệ, 3 mục điều hướng.
- `src/integrations/check-links.ts`: kiểm link nội bộ trong `dist/` sau build.
- `src/layouts/Base.astro`: `<head>`, canonical, OG, JSON-LD, font. Mọi trang đi qua layout này.
- `src/styles/tokens.css` (token design system) và `src/styles/global.css` (biến bố cục, reset, `.prose`).

## Nội dung

- Bài blog ở `src/content/blog/vi/`, case study ở `src/content/projects/vi/`. Trường của từng loại xem trong `src/content.config.ts`.
- `slug` bắt buộc, chỉ gồm `a-z`, `0-9` và `-` đơn, không trùng trong collection, **không đổi sau khi đăng** vì GitHub Pages không có redirect. Tạo từ tiêu đề bằng `slugify()`.
- Tag phải khai báo trong `src/content/tags/tags.yaml` trước rồi mới gắn vào bài. Mỗi bài 1–4 tag. Key tag là thuật ngữ tiếng Anh dạng slug.
- `relatedProjects` chỉ lưu ở bài; chiều ngược được tính lúc build (`getPostsForProject()`).
- Case study theo cấu trúc problem → decisions → outcome, không phải danh sách tính năng. `projects` không có `updatedDate`.
- Frontmatter sai schema làm build thất bại. Đây là chủ ý, đừng nới schema để build qua.

## Quy ước code

- **Lấy bài qua `getPublishedPosts()`**, không gọi thẳng `getCollection("blog")` trong trang. Hàm này là chỗ duy nhất lọc draft và kiểm tham chiếu (IA-005).
- **Dựng URL bằng `postUrl()`, `projectUrl()`, `tagUrl()`.** URL nội bộ luôn có `/` cuối (IA-001); link thiếu `/` làm build thất bại.
- Comment, JSDoc và thông báo lỗi viết bằng **tiếng Việt**, và trích mã quyết định khi code hiện thực một quyết định (ví dụ `// IA-003: ...`). Comment giải thích *vì sao*, không kể lại code.
- Không thêm `client:*`, `<script>` hay framework UI. Mọi thay đổi bố cục làm bằng CSS (ADR-004, RD).
- CSS viết mobile-first, chỉ hai mốc `@media (min-width: 768px)` và `(min-width: 1024px)`. Component dùng ở nhiều độ rộng cột thì dùng container query (RD-007).
- Style đặt trong `<style>` của component. Màu, khoảng cách, cỡ chữ lấy từ biến CSS (`var(--space-lg)`, `var(--fg-muted)`, `var(--fs-h2)`…), không chép số tay.
- **Không sửa tay `src/styles/tokens.css`.** File sinh từ design system SoJDev; đổi giá trị ở design system rồi sinh lại.
- Font khai báo qua Fonts API trong `astro.config.mjs` (font tự host để đủ glyph tiếng Việt), không dùng Google Fonts.
- Ảnh dùng `ImageSlot` / `<Picture>` của `astro:assets`, có tỉ lệ khung cố định để không gây CLS (RD-006).
- Ngày hiển thị qua `formatDate()` / `isoDate()` trong `src/lib/format.ts` (định dạng theo UTC).

## Đừng gỡ

- `slugId()` trong `src/content.config.ts`: Astro 7.3.5 **không** chặn slug trùng khi data store sạch (mọi lần build ở CI).
- `assertReferences()` trong `src/lib/content.ts`: `reference()` tới entry không tồn tại chỉ bị log lỗi, build vẫn chạy tiếp.
- `prerenderConflictBehavior: "error"` và `checkLinks()` trong `astro.config.mjs`.
- `slugify()` tự viết: đã so với package `slugify`, kết quả tiếng Việt giống hệt; bài `tieng-viet-o-goc-url` trích nguyên hàm này.

## Bẫy đã biết

- **Kiểm tra slug trùng hoặc tham chiếu hỏng:** xoá `node_modules/.astro/data-store.json` trước khi build, nếu không phép thử pass sai lý do.
- **`typescript` pin ở `^6`:** `astro check` chưa hỗ trợ TS 7. Nếu thiếu `@astrojs/check` hoặc `typescript`, `astro check` in lỗi nhưng vẫn exit 0.
- **`SITE_URL`:** CI lấy từ `actions/configure-pages` (Settings → Pages), thiếu thì build throw. Build cục bộ không cần, `site` tự thành `http://localhost:4321`. Không viết cứng domain trong code.
- `trailingSlash: "always"` chỉ ràng buộc dev server; với trang prerender thì `checkLinks()` mới là thứ giữ quy ước.

## Tra cứu

- **Tài liệu Astro:** dùng MCP `astro-docs` (`search_astro_docs`) trước khi viết code dùng API Astro; dự án chạy Astro 7, kiến thức cũ có thể sai. Bản đầy đủ: <https://docs.astro.build>.

## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
