# SoJDev site

Portfolio và blog kỹ thuật của Lê Hoàng Lâm: site tĩnh Astro 7, nội dung Markdown/MDX trong repo, deploy lên GitHub Pages. Không có server lúc chạy, không có JavaScript phía client. Mọi thay đổi đều phải giữ được hai điều này.

File này dành cho cả developer lẫn AI agent làm việc trong repo. Nó trả lời ba câu: việc này cần đọc gì trước, sửa ở đâu, kiểm bằng cách nào. Lý do đầy đủ của từng quyết định nằm trong `docs/`; cách chạy local và mẫu frontmatter nằm trong `README.md`. `CLAUDE.md` là symlink tới file này.

## Bắt đầu một việc

Tìm dòng khớp với việc cần làm và đọc cột "Đọc trước" rồi mới sửa. Việc liên quan nhiều dòng thì đọc hết các dòng đó.

| Việc | Đọc trước | Sửa ở | Kiểm bằng |
| --- | --- | --- | --- |
| Viết hoặc sửa bài blog | `src/content.config.ts` (schema `blog`), mục *Nội dung* bên dưới | `src/content/blog/vi/` | `pnpm build`; bài có ảnh, bảng hoặc khối code dài thì xem thêm trên trình duyệt |
| Viết hoặc sửa case study | IA-007 trong `docs/content-system.md`, schema `projects`, bài mẫu `src/content/projects/vi/sojdev-site.md` | `src/content/projects/vi/` | Như trên |
| Thêm tag | IA-002 trong `docs/content-system.md` | `src/content/tags/tags.yaml` | `pnpm build` |
| Thêm hoặc đổi trang, route, URL | IA-001, IA-004 → IA-006, mục *Metadata theo loại trang* | `src/pages/`, `src/layouts/` | `pnpm build` (bắt link hỏng), rồi trình duyệt |
| Sửa component, CSS, bố cục | RD-001 → RD-007 trong `docs/responsive.md`, mục *CSS* bên dưới | `<style>` trong component, `src/styles/global.css` | Trình duyệt, theo mục *Kiểm tra trước khi báo xong* |
| Đổi truy vấn nội dung, bài liên quan, lọc draft | IA-003, IA-005 | `src/lib/content.ts` | `pnpm build` |
| Đổi schema frontmatter hoặc quy tắc slug | *Thay đổi schema so với ADR-003* và *Kiểm tra lúc build* trong `docs/content-system.md` | `src/content.config.ts`, `src/lib/slug.ts` | `pnpm build` sau khi xoá data store (xem *Bẫy*) |
| Đổi `<head>`, canonical, OG, JSON-LD, RSS, sitemap | Mục *Metadata theo loại trang* | `src/layouts/Base.astro`, `src/pages/rss.xml.ts`, `astro.config.mjs` | `pnpm build` rồi `pnpm preview` (chỉ có sau build) |
| Đổi tên site, tagline, liên hệ, menu | IA-004 | `src/lib/site.ts` | Trình duyệt ở 320 (header phải vừa một dòng) |
| Đổi font hoặc token màu, khoảng cách | ADR-006 (font tự host), mục *Token trong design system* trong `docs/responsive.md` | Font: `astro.config.mjs`. Token: **không sửa ở repo**, xem *Hỏi trước* | Trình duyệt, sáng và tối |
| Đổi build, CI, deploy | ADR-005 trong `docs/architecture.md` | `package.json`, `astro.config.mjs`, `.github/workflows/deploy.yml` | `pnpm build` |

## Tìm code

- **CodeGraph trước grep.** Repo đã index sẵn trong `.codegraph/`. Trên shell chạy `codegraph explore "<symbol hoặc câu hỏi>"`; agent có MCP thì gọi `codegraph_explore` (tool bị hoãn thì nạp qua tool search). Một lần gọi trả về mã nguồn kèm số dòng, nơi gọi và phạm vi ảnh hưởng.
- **API Astro:** dự án chạy Astro 7, nên kiến thức về bản cũ hơn có thể sai. Tra tài liệu trước khi viết code dùng API Astro: agent dùng MCP `astro-docs` (`search_astro_docs`), developer mở <https://docs.astro.build>.
- **Quyết định:** mỗi file trong `docs/` chia mục theo mã. Grep mã (`ADR-004`, `IA-003`, `RD-006`…) để nhảy thẳng tới mục cần đọc, không cần đọc cả file.

| Mã | File | Phạm vi |
| --- | --- | --- |
| ADR-001 → ADR-006 | `docs/architecture.md` | SSG, Astro, nội dung trong repo, dữ liệu API lấy lúc build, hosting/CI, tiếng Việt ở gốc |
| IA-001 → IA-007 | `docs/content-system.md` | URL, tag, liên kết bài ↔ dự án, điều hướng, trang danh sách, trang chủ, khung case study, metadata |
| RD-001 → RD-007 | `docs/responsive.md` | Breakpoint, lưới, cỡ chữ, điều hướng, sắp xếp khối, ảnh, container query |

Các file sau ảnh hưởng toàn site, sửa thì cẩn thận:

- `src/content.config.ts`: schema ba collection `blog`, `projects`, `tags` và `slugId()`.
- `src/lib/content.ts`: mọi truy vấn nội dung, `assertReferences()`, `assertDecisionSections()`, hàm dựng URL `postUrl()`, `projectUrl()`, `tagUrl()`.
- `src/lib/slug.ts`: `slugify()`, `SLUG_PATTERN`, `slugSchema`.
- `src/lib/format.ts`: `formatDate()`, `isoDate()` (định dạng theo UTC).
- `src/layouts/Base.astro`: mọi trang đi qua layout này.
- `src/integrations/check-links.ts`: kiểm link nội bộ trong `dist/` sau build.
- `src/lib/markdown-tables.ts`: plugin Sätteri chạy trên mọi bảng Markdown, gắn nhãn cột để bảng xếp thành khối trên màn hẹp (RD-005).
- `src/styles/tokens.css` (sinh từ design system) và `src/styles/global.css` (biến bố cục, reset, `.prose`).

## Quy tắc khi sửa

### Nội dung

- **`slug` không đổi sau khi đăng.** GitHub Pages không có redirect, đổi slug là gãy mọi link cũ. Slug bắt buộc, chỉ gồm `a-z`, `0-9` và `-` đơn, không trùng trong collection; tạo từ tiêu đề bằng `slugify()`.
- **Tag khai báo trước, gắn sau.** Thêm key vào `src/content/tags/tags.yaml` rồi mới dùng trong bài. Key là thuật ngữ tiếng Anh dạng slug, mỗi bài 1–4 tag.
- **`relatedProjects` chỉ lưu ở bài.** Chiều ngược (dự án → bài) tính lúc build bằng `getPostsForProject()`, không thêm trường ngược vào `projects`.
- **Case study là problem → decisions → outcome**, không phải danh sách tính năng (IA-007). Frontmatter là overview, 2–4 quyết định, mỗi trường có giới hạn độ dài; thân bài là bằng chứng, mỗi quyết định một mục `##` trùng tên và thứ tự với `decisions[].title`. Vượt giới hạn thì viết lại, không cắt câu. `updatedDate` chỉ đặt khi cập nhật `outcome`.
- **Frontmatter sai schema làm build thất bại, và đó là chủ ý.** Sửa frontmatter cho đúng; không nới schema để build qua.

### Code

- **Lấy bài qua `getPublishedPosts()`**, không gọi thẳng `getCollection("blog")` trong trang: đây là chỗ duy nhất lọc draft và chạy `assertReferences()` (IA-005). Tương tự, **lấy dự án qua `getProjects()`**: đây là chỗ chạy `assertDecisionSections()` (IA-007).
- **Dựng URL nội bộ bằng `postUrl()`, `projectUrl()`, `tagUrl()`.** URL luôn có `/` cuối (IA-001); link thiếu `/` bị `checkLinks()` bắt và làm build thất bại.
- **Không `client:*`, không `<script>`, không framework UI.** Mọi thay đổi bố cục làm bằng CSS. ADR-004 có để ngỏ island của dịch vụ bên thứ ba (bình luận, analytics), nhưng thêm cái nào cũng phải hỏi trước.
- **Ảnh dùng `ImageSlot` hoặc `<Picture>` của `astro:assets`** với tỉ lệ khung cố định, để không gây CLS (RD-006).
- **Ngày hiển thị qua `formatDate()` / `isoDate()`**, không tự format.
- **Font khai báo qua Fonts API trong `astro.config.mjs`**, file tự host để đủ glyph tiếng Việt. Không dùng Google Fonts.
- **Comment, JSDoc, thông báo lỗi viết bằng tiếng Việt.** Comment giải thích *vì sao*, không kể lại code. Code hiện thực một quyết định thì trích mã, ví dụ `// IA-003: ...`.
- **Không viết cứng domain.** `site` lấy từ `SITE_URL`; build cục bộ không có biến này thì tự thành `http://localhost:4321`.

### CSS

- **Mobile-first, chỉ hai mốc:** `@media (min-width: 768px)` và `(min-width: 1024px)` (RD-001). Component dùng ở nhiều độ rộng cột thì dùng container query (RD-007).
- **Style đặt trong `<style>` của component.** Màu, khoảng cách, cỡ chữ lấy từ biến CSS, không chép số tay.
- **Khoảng cách chỉ dùng thang** `--space-xs` … `--space-5xl` (4, 8, 16, 24, 32, 48, 64, 96, 128). Giá trị lọt giữa hai bậc thì chọn một bậc, không thêm bậc mới.
- **Cỡ chữ chỉ dùng style của design system:** tiêu đề `--fs-h1`/`--fs-h2`/`--fs-h4` (co giãn), `--fs-h5`, `--fs-body-lg`, `--fs-body`, `--fs-caption`, `--fs-micro`, chữ mono `--fs-code`. Các biến cố định khai báo ở đầu `global.css`. Không dùng `px` cho cỡ chữ (RD-003).
- **Được viết số trực tiếp** cho viền `1px`, độ rộng cột cố định trong `grid-template-columns`, và kích thước riêng của component đúng như design system ghi (chip 28, hàng 404 cao 64).

## Kiểm tra trước khi báo xong

### Build

Chạy `pnpm build` sau mọi thay đổi trong `src/`. Đây là quality gate của CI: build lỗi thì không deploy. Lệnh chạy `astro check`, `astro build`, rồi `checkLinks()` kiểm link nội bộ, mất khoảng 10 giây.

Dùng **pnpm** (CI chạy `pnpm@12.6.0`). `astro` không nằm trên PATH nên luôn gọi qua `pnpm`:

```zsh
pnpm install
pnpm astro dev --background   # dev server tại http://localhost:4321
pnpm astro dev status         # cũng có: stop, logs
pnpm build
pnpm preview                  # xem bản build
```

### Trình duyệt

`pnpm build` chỉ bắt lỗi schema, type và link. Bố cục, màu và responsive phải kiểm trên trình duyệt thật. Repo dùng `playwright-cli` để đo (hướng dẫn trong skill `.claude/skills/playwright-cli/`). Agent tự chạy các bước này, không nhờ người mở trình duyệt hộ; developer dùng cùng lệnh hoặc DevTools.

- **Khi nào:** sau mọi thay đổi CSS, layout hoặc component. Thay đổi chỉ ở Markdown thì bỏ qua, trừ khi bài có ảnh, bảng hoặc khối code dài.
- **Chạy ở đâu:** trên dev server (`pnpm astro dev status`; chưa chạy thì `--background`). Thứ chỉ có sau build (canonical, sitemap, RSS, URL cuối) thì dùng `pnpm preview`.
- **Chạy từ gốc repo** để `playwright-cli` đọc `.playwright/cli.config.json` (Chromium). Snapshot và ảnh rơi vào `.playwright-cli/` (đã gitignore); ảnh cần giữ thì lưu vào scratchpad bằng `--filename`.
- **Kiểm gì:** checklist *Kiểm tra trước khi đăng* trong `docs/responsive.md`, chỉ những độ rộng và mục liên quan đến phần vừa đổi. Tối thiểu 320 và 1280, cả sáng lẫn tối.
- **Đo trước, nhìn sau.** Đọc snapshot và `eval` ra số rồi so với quyết định; chụp ảnh khi cần xem màu, căn chỉnh, hoặc gửi người dùng.
- Đóng trình duyệt khi xong.

```zsh
playwright-cli open http://localhost:4321/blog/
playwright-cli resize 320 800
playwright-cli --raw eval "document.documentElement.scrollWidth > innerWidth"   # true = cuộn ngang, vi phạm RD-002
playwright-cli set-color-scheme dark
playwright-cli screenshot --filename=<scratchpad>/blog-320-dark.png
playwright-cli console warning                                                   # site không có JS: mọi lỗi console đều đáng xem
playwright-cli close
```

## Hỏi trước khi làm

Những việc sau phải được chủ repo đồng ý trước, kể cả khi trông như cách sửa nhanh nhất. Agent thì hỏi người dùng trong phiên làm việc.

- **Làm ngược một stop rule.** Mỗi file trong `docs/` có mục *Stop rules* liệt kê những gì không thêm vào (database, SSR, CMS, category, phân trang, hamburger, breakpoint thứ ba, JS đổi bố cục…).
- **Sửa `src/styles/tokens.css`.** File sinh từ design system SoJDev; giá trị phải đổi ở design system rồi sinh lại.
- **Đổi `slug` của nội dung đã đăng.**
- **Thêm test suite trình duyệt:** Playwright test, `@playwright/test`, hay bước trình duyệt trong CI. `playwright-cli` là công cụ kiểm tra thủ công, không phải quality gate.
- **Gỡ một trong các cơ chế chặn lỗi dưới đây.** Mỗi cơ chế bù cho một lỗi mà Astro không tự chặn:
  - `slugId()` trong `src/content.config.ts`: Astro 7.3.5 không chặn slug trùng khi data store sạch, tức mọi lần build ở CI.
  - `assertReferences()` trong `src/lib/content.ts`: `reference()` tới entry không tồn tại chỉ bị log lỗi, build vẫn chạy tiếp.
  - `prerenderConflictBehavior: "error"` và `checkLinks()` trong `astro.config.mjs`: mặc định Astro chỉ cảnh báo khi hai route sinh cùng URL. `trailingSlash: "always"` chỉ ràng buộc dev server; với trang prerender, `checkLinks()` mới giữ quy ước `/` cuối.
  - `slugify()` tự viết trong `src/lib/slug.ts`: đã so với package `slugify`, kết quả tiếng Việt giống hệt; bài `tieng-viet-o-goc-url` trích nguyên hàm này.

## Bẫy

- **Thử slug trùng hoặc tham chiếu hỏng mà build vẫn pass.** Data store cũ đang che lỗi. Xoá `node_modules/.astro/data-store.json` rồi build lại.
- **`astro check` in lỗi nhưng exit 0.** Xảy ra khi thiếu `@astrojs/check` hoặc `typescript`, nên phải đọc output chứ đừng chỉ nhìn exit code. `typescript` pin ở `^6` vì `astro check` chưa hỗ trợ TS 7; đừng nâng lên 7.
- **Build ở CI throw vì thiếu `SITE_URL`.** CI lấy giá trị này từ `actions/configure-pages` (Settings → Pages). Build cục bộ không cần.
