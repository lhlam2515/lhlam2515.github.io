---
title: "SoJDev — portfolio và blog kỹ thuật"
summary: "Site tĩnh bằng Astro trên GitHub Pages, nơi mỗi lựa chọn kiến trúc được ghi lại thành ADR trước khi viết dòng code đầu tiên."
slug: sojdev-site
role: "Tác giả duy nhất: kiến trúc, code, nội dung, CI/CD"
stack: [Astro, TypeScript, Markdown, GitHub Actions, GitHub Pages]
problem: "Cần một nơi trình bày dự án và bài viết kỹ thuật bằng tiếng Việt, chi phí 0 đồng, không phải vận hành server, và không để lỗi nội dung lọt lên site."
decisions:
  - title: "SSG thuần, không runtime server"
    rationale: "GitHub Pages chỉ phục vụ file tĩnh, còn nội dung chỉ đổi khi tôi đăng bài. Output là một thư mục dist/, chuyển host chỉ là đổi bước deploy."
  - title: "Astro thay vì Next.js"
    rationale: "Ở chế độ static export, Next.js mất ISR, Image Optimization, Redirects, Headers, Server Actions nhưng vẫn gửi React runtime xuống mọi trang. Astro mặc định không gửi JS và có schema cho nội dung."
  - title: "Markdown trong repo, kiểm tra bằng schema"
    rationale: "Một tác giả dùng Git hằng ngày thì Git là CMS đủ tốt. Frontmatter sai schema, kể cả slug có dấu, làm build thất bại."
  - title: "Tiếng Việt ở gốc URL, slug ASCII bất biến"
    rationale: "URL là thứ đắt nhất để đổi, và GitHub Pages không có redirect phía server. Tiếng Anh thêm sau dưới /en/ mà không URL cũ nào đổi."
outcome: "Pipeline chạy thật từ push lên main tới GitHub Pages, khoảng 1 phút mỗi lần deploy ở giai đoạn scaffold. Schema nội dung đã được kiểm chứng bằng 2 bài blog và 2 case study thật."
repoUrl: "https://github.com/lhlam2515/lhlam2515.github.io"
liveUrl: "https://lhlam2515.github.io"
featured: true
order: 1
---

## Vấn đề

Tôi muốn xây thương hiệu cá nhân qua hai loại nội dung: dự án và bài viết kỹ thuật. Tải của site rất rõ: đọc nhiều, ghi ít, một tác giả, không có dữ liệu người dùng. Ràng buộc cũng rõ: host miễn phí trên GitHub Pages, tức là chỉ có file tĩnh, không header tùy chỉnh, không redirect phía server.

Rủi ro tôi lo nhất không phải hiệu năng mà là những quyết định đắt về sau: URL phải đổi, nội dung sai định dạng lọt lên site, hay một tính năng "để dành" trở thành phụ thuộc ẩn.

## Quyết định

Trước khi khởi tạo project, tôi viết sáu ADR cho sáu quyết định: loại ứng dụng, framework, nguồn nội dung, cách xử lý dữ liệu động, hosting và ngôn ngữ. Mỗi ADR ghi các phương án đã cân nhắc, trade-off, và điều kiện để đảo ngược quyết định.

Vài điểm đáng kể:

- **Quality gate trước deploy.** `astro check` chạy trước `astro build`; build lỗi thì không deploy. Trong lúc dựng pipeline, tôi phát hiện `astro check` vẫn trả exit code 0 khi thiếu dependency, nên gate này phải được kiểm tra bằng output thật, không chỉ bằng exit code.
- **Slug kiểm tra bằng regex trong schema.** Quy ước "slug không dấu" thôi thì sớm muộn sẽ bị vi phạm. Đưa nó vào schema biến lỗi thành build thất bại.
- **Dữ liệu động ưu tiên build-time.** Bình luận, analytics, form liên hệ nếu có sẽ là island gỡ được; gỡ đi thì build không được hỏng.

## Kết quả

<!-- TODO(Lâm): bổ sung khi có số liệu — điểm Lighthouse baseline (spike "Đo baseline"), thời gian build khi đã có nội dung thật, custom domain. -->

Workflow deploy đã chạy thành công, mỗi lần khoảng một phút với bản scaffold. Spike kiểm tra schema là lần đầu cấu trúc `problem → decisions → outcome` được thử trên dự án thật, và case study này là một trong hai bài thử.
