---
title: "SoJDev — portfolio và blog kỹ thuật"
summary: "Portfolio và blog tiếng Việt chạy trên GitHub Pages với 0 đồng, nơi lỗi nội dung và link sai bị chặn từ lúc build, trước khi lên site."
slug: sojdev-site
role: "Tác giả duy nhất: kiến trúc, code, nội dung, CI/CD"
stack: [Astro, TypeScript, Markdown, GitHub Actions, GitHub Pages]
problem: "Cần một nơi của riêng mình để trình bày dự án và bài viết kỹ thuật tiếng Việt, với ba tiêu chí: không tốn tiền và không vận hành server; URL đã chia sẻ không bao giờ phải đổi; lỗi nội dung bị chặn trước khi lên site thay vì được phát hiện sau."
decisions:
  - title: "SSG thuần bằng Astro, không dùng Next.js static export"
    label: "Astro thay Next.js"
    rationale: "Chọn Astro thay vì Next.js, stack tôi quen nhất, vì ở chế độ static export Next.js mất phần lớn tính năng như ISR, Redirects, Headers nhưng vẫn gửi React runtime xuống mọi trang. Cái giá là phải học cú pháp .astro và mô hình island."
  - title: "Schema nội dung là quality gate trước deploy"
    label: "Schema là quality gate"
    rationale: "Quy ước chỉ ghi trong README sớm muộn sẽ bị vi phạm, nên slug, tag và tham chiếu giữa bài và dự án được kiểm lúc build; sai là không deploy. Hai chỗ Astro không tự chặn, slug trùng và tham chiếu hỏng, tôi phải tự viết kiểm tra."
  - title: "URL bất biến: tiếng Việt ở gốc, slug ASCII, luôn có dấu / cuối"
    label: "URL bất biến"
    rationale: "GitHub Pages không có redirect phía server, nên URL đã chia sẻ không được đổi. Tiếng Anh sẽ nằm dưới /en/ để không URL cũ nào phải dời, và link nội bộ sai dạng làm build thất bại. Đổi lại, URL của hai ngôn ngữ không đối xứng."
  - title: "User site trên GitHub Pages, domain nằm ngoài code"
    label: "User site, domain ngoài code"
    rationale: "Repo <user>.github.io không cần cấu hình base, nên link nội bộ không phải thêm tiền tố như ở project repo. Origin của site đi vào build từ Settings → Pages, nên gắn custom domain không phải sửa code. Đổi lại, không có preview deploy cho từng pull request."
outcome: "Site chạy trên GitHub Pages với 0 đồng và không có server. Slug có dấu hoặc trùng, tag chưa khai báo, tham chiếu tới dự án không tồn tại và link nội bộ sai dạng đều làm build thất bại trước khi deploy. Chưa đo: hiệu năng, và độ bền của URL khi gắn custom domain."
repoUrl: "https://github.com/lhlam2515/lhlam2515.github.io"
liveUrl: "https://lhlam2515.github.io"
featured: true
order: 1
---

## Bối cảnh

Tôi muốn xây thương hiệu cá nhân qua hai loại nội dung: dự án và bài viết kỹ thuật. Tải của site rất rõ: đọc nhiều, ghi ít, một tác giả, không có dữ liệu người dùng. Ràng buộc cũng rõ: host miễn phí trên GitHub Pages, tức là chỉ có file tĩnh, không header tùy chỉnh, không redirect phía server.

Rủi ro tôi lo nhất không phải hiệu năng mà là những quyết định đắt về sau: URL phải đổi, nội dung sai định dạng lọt lên site, hay một tính năng "để dành" trở thành phụ thuộc ẩn. Vì vậy, trước khi khởi tạo project, tôi viết sáu ADR và một tài liệu kiến trúc thông tin, mỗi quyết định ghi các phương án đã cân nhắc, trade-off và điều kiện để đảo ngược. Bốn quyết định dưới đây là những quyết định định hình site nhiều nhất.

## SSG thuần bằng Astro, không dùng Next.js static export

**Phương án đã cân nhắc.**

- *Next.js với `output: 'export'`*: stack tôi dùng hằng ngày. Nhưng ở chế độ này, Next.js mất ISR, Image Optimization với loader mặc định, Redirects, Headers, Server Actions và Draft Mode, trong khi React runtime vẫn có trên mọi trang.
- *SPA render phía client*: HTML ban đầu rỗng, deep link cần mẹo `404.html`, kém cho SEO.
- *SSR hoặc serverless*: không chạy được trên GitHub Pages.
- *Hugo hoặc Jekyll*: nhẹ, nhưng dùng Go template hoặc Liquid, không tận dụng được TypeScript và hệ sinh thái npm.

**Vì sao chọn.** Nội dung chỉ đổi khi tôi đăng bài, nên render mọi trang thành HTML lúc build là đủ. Astro được thiết kế cho đúng loại site này: mặc định không gửi JavaScript, content collections có schema, và có GitHub Action deploy chính thức. Về tín hiệu tuyển dụng, portfolio chứng minh năng lực qua các dự án nó trình bày, không qua framework của chính site.

**Bằng chứng.** Bản build ngày 28/09/2026 (Astro 7.3.5, 14 trang) có 0 file `.js` trong `dist/`, và trang case study này không có thẻ `<script>` nào. Next.js static export không làm được điều đó, vì vẫn gửi React runtime xuống mọi trang. Output là một thư mục `dist/` deploy nguyên trạng, nên chuyển sang host tĩnh khác chỉ là đổi bước deploy trong [workflow](https://github.com/lhlam2515/lhlam2515.github.io/blob/main/.github/workflows/deploy.yml).

**Cái giá.** Phải học cú pháp `.astro` và mô hình island. Tôi sẽ cân nhắc lại Next.js nếu site cần những trang tương tác phức tạp chiếm phần lớn nội dung, ví dụ demo sống của dự án.

## Schema nội dung là quality gate trước deploy

**Phương án đã cân nhắc.** Quy ước ghi trong README, CMS dựa trên Git có giao diện soạn thảo, hoặc headless CMS. Hai phương án sau thêm một lớp cấu hình và đưa nội dung ra khỏi repo, trong khi tôi là tác giả duy nhất và dùng Git hằng ngày.

**Vì sao chọn.** Nội dung là Markdown trong repo, và mọi quy ước được viết thành schema trong [`src/content.config.ts`](https://github.com/lhlam2515/lhlam2515.github.io/blob/main/src/content.config.ts). Script `build` chạy `astro check`, build (kèm schema), rồi kiểm tra link, ở máy cũng như ở CI. Bước nào lỗi thì không deploy.

**Bằng chứng.** Các trường hợp sau đều làm build thất bại, đã thử trên data store sạch:

- slug có dấu hoặc thiếu slug; case study thiếu `decisions`; `updatedDate` trước `pubDate`;
- bài gắn tag chưa khai báo, hoặc có 0 hay 5 tag;
- `relatedProjects` trỏ tới dự án không tồn tại;
- hai route sinh cùng một URL (`prerenderConflictBehavior: "error"`; mặc định Astro chỉ cảnh báo rồi tự chọn một bên).

Trong lúc thử, tôi gặp hai chỗ Astro 7.3.5 không tự chặn:

- **Slug trùng.** Check có sẵn chỉ là cảnh báo. Trên data store sạch, tức mọi lần build ở CI, nó không bắt được gì vì loader xử lý các file song song. Tôi chuyển việc kiểm vào `generateId`, hàm chạy đồng bộ cho từng file nên không bị race.
- **Tham chiếu hỏng.** `reference()` tới entry không tồn tại chỉ log `[ERROR] Invalid content reference` rồi build tiếp; `getEntry()` trả `undefined`. Bài draft không được render nên lọt qua hoàn toàn. [`getPublishedPosts()`](https://github.com/lhlam2515/lhlam2515.github.io/blob/main/src/lib/content.ts) kiểm mọi tag và `relatedProjects` của mọi bài, kể cả draft, và throw kèm tên file.

Khi dựng pipeline, tôi cũng thấy `astro check` của Astro 7.3.5 in lỗi nhưng trả exit code 0 khi chưa cài `@astrojs/check` và `typescript`, tức là gate trong CI không chặn gì. Tôi thêm hai package này vào devDependencies ([commit `e860027`](https://github.com/lhlam2515/lhlam2515.github.io/commit/e860027)). Từ đó, gate được xác nhận bằng output thật, không chỉ bằng exit code.

**Cái giá.** Thêm tag mới là hai bước: khai báo, rồi gắn. Frontmatter sai thì không đăng được. Cả hai là ma sát có chủ ý.

## URL bất biến: tiếng Việt ở gốc, slug ASCII, luôn có dấu / cuối

**Phương án đã cân nhắc.**

- *Tiền tố cho mọi ngôn ngữ (`/vi/`, `/en/`)*: đối xứng, nhưng phức tạp cho một ngôn ngữ chưa tồn tại, và URL không tiền tố trả 404 nếu không cấu hình fallback.
- *Không chuẩn bị gì*: nhanh nhất lúc đầu, nhưng khi thêm tiếng Anh có thể phải đổi slug hoặc di chuyển file.
- *Ngày hoặc category trong URL* (`/2026/09/<slug>/`, `/blog/<category>/<slug>/`): bài trông cũ dù đã cập nhật, và đổi category là vỡ URL.

**Vì sao chọn.** URL là thứ đắt nhất để đổi, và trên GitHub Pages không có redirect để sửa sai. Tiếng Việt nằm ở gốc, tiếng Anh sẽ thêm dưới `/en/`, nên bật song ngữ là thay đổi thuần cộng thêm. Slug là ASCII bỏ dấu và bất biến sau khi đăng; slug tag luôn là thuật ngữ tiếng Anh để dùng chung cho cả hai ngôn ngữ.

**Bằng chứng.**

- `slugify()` xử lý `đ` trước khi chuẩn hoá NFD, vì U+0111 là một chữ cái riêng, không phải `d` cộng dấu, nên NFD không tách được. Schema từ chối mọi slug ngoài `a-z`, `0-9` và `-`.
- `trailingSlash: "always"` của Astro không đủ: nó chỉ ràng buộc dev server và trang render theo yêu cầu, còn với trang prerender thì host quyết định. Vì vậy [`check-links.ts`](https://github.com/lhlam2515/lhlam2515.github.io/blob/main/src/integrations/check-links.ts) quét `dist/` sau build và làm build thất bại khi link nội bộ thiếu dấu `/` cuối hoặc trỏ tới file không tồn tại. Link ngoài không được kiểm, để lỗi mạng của site khác không chặn deploy.
- GitHub Pages trả 301 từ `/versions` sang `/versions/` khi thư mục có `index.html` (đo trên `pages.github.com`).

**Cái giá.** URL của hai ngôn ngữ không đối xứng, và URL tiếng Việt lẫn slug tag tiếng Anh.

## User site trên GitHub Pages, domain nằm ngoài code

**Phương án đã cân nhắc.**

- *Project repo*: site nằm dưới `/<repo>/`, phải cấu hình `base` và thêm tiền tố vào mọi link nội bộ, dễ lỗi.
- *Cloudflare Pages hoặc Netlify*: có header và redirect thật ở gói miễn phí. Tôi giữ phương án này làm đường thoát.

**Vì sao chọn.** User site `<user>.github.io` không cần `base`, và gộp code, CI, hosting vào một nơi. Domain không được ghi trong code: `actions/configure-pages` đọc origin hiện tại (github.io hoặc custom domain) và truyền vào build qua `SITE_URL`.

**Bằng chứng.** [`astro.config.mjs`](https://github.com/lhlam2515/lhlam2515.github.io/blob/main/astro.config.mjs) dùng `SITE_URL` làm `site` và làm build thất bại nếu thiếu biến này ở CI, nên canonical và sitemap không thể vô tình trỏ về localhost.

**Cái giá.** Không có preview deploy cho từng pull request, không có HTTP header tùy chỉnh (CSP chỉ đặt được qua thẻ `<meta>`), không có redirect phía server. Tôi sẽ chuyển host nếu chạm giới hạn băng thông 100 GB/tháng, cần header hoặc redirect thật, hoặc site có mục đích thương mại.

## Đối chiếu kết quả

| Tiêu chí | Kết quả | Bằng chứng |
| --- | --- | --- |
| Không tốn tiền, không vận hành server | Đạt | Build và deploy bằng GitHub Actions lên GitHub Pages, ví dụ [lần chạy ngày 28/09/2026](https://github.com/lhlam2515/lhlam2515.github.io/actions/runs/36378005673); output chỉ là file tĩnh |
| URL đã chia sẻ không phải đổi | Có cơ chế giữ, chưa đo khi đổi domain | Slug kiểm bằng schema; link sai dạng làm build thất bại; domain nằm ngoài code |
| Lỗi nội dung bị chặn trước khi lên site | Đạt với các lỗi đã biết | Danh sách trường hợp làm build thất bại ở mục "Schema nội dung là quality gate trước deploy" |

## Còn mở

- **Hiệu năng.** Chưa chạy Lighthouse baseline. Sẽ đo trước khi thêm bất kỳ island nào, rồi bổ sung số vào mục "Đối chiếu kết quả".
- **Custom domain.** Chưa gắn. Chưa kiểm chứng `lhlam2515.github.io/<đường dẫn>` có được chuyển 301 sang domain mới, giữ nguyên đường dẫn hay không; nên gắn domain trước khi link bị chia sẻ rộng.
- **Dấu `/` cuối trên chính site này.** Mới đo trên `pages.github.com`, chưa đo trên `/blog` của site.

Các quyết định còn lại, như lấy dữ liệu động lúc build và giữ mọi island gỡ được, nằm trong [tài liệu kiến trúc](https://github.com/lhlam2515/lhlam2515.github.io/blob/main/docs/architecture.md).
