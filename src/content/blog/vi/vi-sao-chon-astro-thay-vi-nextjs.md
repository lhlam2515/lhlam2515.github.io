---
title: "Vì sao tôi chọn Astro thay vì Next.js cho blog và portfolio"
description: "Next.js là stack tôi dùng hằng ngày, nhưng ở chế độ static export trên GitHub Pages, phần lớn lý do để dùng nó biến mất."
slug: vi-sao-chon-astro-thay-vi-nextjs
pubDate: 2026-09-27
tags: [astro, nextjs, architecture]
relatedProjects: [sojdev-site]
---

Stack chính của tôi là Next.js và TypeScript. Khi bắt đầu làm site này, lựa chọn hiển nhiên là dựng thêm một app Next.js nữa. Tôi không làm vậy, và lý do nằm ở chỗ site sẽ chạy ở đâu chứ không nằm ở framework nào tốt hơn.

## Ràng buộc đến trước

Site host trên GitHub Pages. GitHub Pages chỉ phục vụ file tĩnh: không có server, không tùy chỉnh HTTP header, không redirect phía server. Nội dung là bài viết và case study, thay đổi khi tôi đăng bài chứ không thay đổi theo từng request. Vậy nên site là SSG thuần: mọi trang render thành HTML lúc build, rồi đẩy nguyên thư mục lên.

Khi ràng buộc đó đã chốt, câu hỏi đổi từ "framework nào tôi quen nhất" thành "framework nào phục vụ nội dung tĩnh tốt nhất".

## Next.js ở chế độ static export còn lại gì

Next.js chạy được trên host tĩnh qua `output: 'export'`. Nhưng [tài liệu static exports](https://nextjs.org/docs/app/guides/static-exports) liệt kê những gì không còn dùng được, và đó lại chính là những tính năng khiến tôi chọn Next.js cho các dự án khác:

- ISR
- Image Optimization với loader mặc định
- Redirects và Headers
- Server Actions
- Draft Mode

Cái vẫn còn là React runtime, gửi xuống trên mọi trang, kể cả trang chỉ có chữ. Nói cách khác: tôi trả đủ chi phí của Next.js nhưng chỉ dùng được phần mà framework nào cũng có.

## Astro được làm cho đúng loại site này

Astro mặc định không gửi JavaScript xuống trình duyệt. Khi một thành phần thật sự cần tương tác, Astro đưa nó vào dưới dạng island, và island đó có thể viết bằng React. TypeScript vẫn dùng được như bình thường.

Điểm làm tôi chốt là content collections. Mỗi bài viết là một file Markdown, frontmatter được kiểm tra bằng schema lúc build. Viết sai tên trường, quên ngày đăng hay đặt slug có dấu thì build thất bại. Với Next.js, tôi sẽ phải tự dựng lớp này.

Deploy cũng gọn: Astro có [GitHub Action chính thức](https://docs.astro.build/en/guides/deploy/github/), workflow chỉ còn vài bước.

## So sánh

| | Astro | Next.js (static export) | Hugo / Jekyll |
| --- | --- | --- | --- |
| Mức quen thuộc với tôi | Mới | Cao | Thấp |
| JS gửi xuống client | Chỉ island | React runtime mọi trang | Ít |
| Schema cho nội dung | Có sẵn | Tự làm | Không |
| TypeScript, npm | Có | Có | Không |

Next.js chỉ thắng ở mức quen thuộc. Hugo và Jekyll nhẹ, nhưng bắt tôi học Go template hoặc Liquid và bỏ hệ sinh thái npm.

## Còn chuyện nhà tuyển dụng?

Tôi có lo rằng một portfolio viết bằng Next.js sẽ là tín hiệu tốt hơn cho người tuyển dụng tìm Next.js developer. Nghĩ kỹ thì portfolio chứng minh năng lực qua các dự án nó trình bày, không qua framework của chính nó. Các dự án Next.js của tôi vẫn nằm trong mục dự án.

## Đánh đổi

Đổi lại, tôi phải học cú pháp `.astro` và mô hình island. Đó là công sức có thật, nhưng chỉ bỏ ra một lần.

Tôi cũng ghi lại điều kiện để đảo ngược quyết định này: nếu site cần nhiều trang tương tác phức tạp, chẳng hạn demo sống của dự án chiếm phần lớn nội dung, thì Next.js đáng được cân nhắc lại. Hiện tại, site là chữ và code, và Astro vừa khít với việc đó.
