# SoJDev Site — Nguyên tắc responsive

Cập nhật: 28/09/2026 · Tác giả: Lê Hoàng Lâm · Tài liệu nền: [architecture.md](./architecture.md), [content-system.md](./content-system.md) · Thiết kế: canvas "SoJDev site", trang Responsive

## Phạm vi

Tài liệu này quyết định **site thay đổi thế nào theo chiều rộng màn hình**: breakpoint, lưới, cỡ chữ, cách từng khối sắp xếp lại, ảnh và vùng chạm. Nó không quyết định màu, font hay khoảng cách gốc; những thứ đó thuộc design system SoJDev. Nó cũng không đổi sơ đồ trang hay URL của content-system.md.

Đây là nguồn tham chiếu khi code layout và component Astro. Token tương ứng trong design system được liệt kê ở mục [Token trong design system](#token-trong-design-system).

## Drivers

**Người đọc và thiết bị:**

| Người đọc | Đường vào điển hình | Thiết bị giả định |
| --- | --- | --- |
| Nhà tuyển dụng / tech lead | Link từ CV, LinkedIn | Điện thoại hoặc laptop |
| Developer | Tìm kiếm, link chia sẻ → thẳng vào bài | Laptop khi đọc sâu, điện thoại khi lướt |

Tỉ lệ thiết bị thật chưa có số liệu; cột thứ ba là giả định cho đến khi có analytics (ADR-004).

**Ràng buộc kế thừa:**

- Không có runtime server, trang gần như không có JavaScript (ADR-001, ADR-002). Hệ quả: **mọi thay đổi bố cục phải làm bằng CSS**, không bằng JS.
- Header có đúng 3 mục (IA-004).
- `/blog/` không phân trang, không lọc phía client (IA-005).
- Design system SoJDev: container 1200, lưới 12 cột, gutter 24, cột đọc 720, section cách nhau `space-3xl` trên desktop và `space-2xl` trên mobile, lưới 4 cột trên mobile.
**Danh mục quyết định:**

| RD | Quyết định | Lựa chọn | Đảo ngược được? |
| --- | --- | --- | --- |
| RD-001 | Breakpoint | Mobile-first, hai mốc 768 và 1024 | Có |
| RD-002 | Lưới và container | 4 / 8 / 12 cột, nội dung tối đa 1200 | Có |
| RD-003 | Cỡ chữ | Chỉ tiêu đề co giãn bằng `clamp()` | Có |
| RD-004 | Điều hướng và tương tác | Không hamburger; vùng chạm tối thiểu 44 | Có |
| RD-005 | Sắp xếp lại từng khối | Cùng nội dung, cùng thứ tự đọc | Có |
| RD-006 | Ảnh | Giữ chỗ trước khi tải; ảnh chụp dự án có bản sáng và tối | Có |
| RD-007 | Component dùng lại | Container query thay vì media query | Có |

Không quyết định nào ở đây chạm URL, nên tất cả đảo ngược được.

## RD-001: Breakpoint — mobile-first, hai mốc

### Quyết định

| Khoảng | Chiều rộng | Khung thiết kế |
| --- | --- | --- |
| Mobile | 320 đến 767 | 390 |
| Tablet | 768 đến 1023 | 768 |
| Laptop | 1024 trở lên, nội dung dừng ở 1200 | 1280 |

- CSS viết cho mobile trước, rồi mở rộng bằng `@media (min-width: 768px)` và `@media (min-width: 1024px)`.
- **Breakpoint là mốc đổi bố cục.** Riêng lề trang có thêm một media query ở 360 (xem RD-002); nó chỉ đổi một token, không đổi bố cục.
- Thẻ viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">`. Không dùng `maximum-scale` hay `user-scalable=no`.

### Các phương án

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| **Hai mốc, mobile-first (chọn)** | Ít trạng thái để kiểm tra; CSS mặc định là bản mobile, tải nhẹ nhất | Khoảng 1024 đến 1200 hơi chật với lưới 12 cột |
| Ba mốc (thêm 1280 hoặc 1440) | Tinh chỉnh được màn rộng | Thêm một trạng thái cho mọi khối, nhưng nội dung đã dừng ở 1200 |
| Desktop-first (`max-width`) | Quen với cách thiết kế từ 1280 | Bản mobile là phần ghi đè, dễ sót |

### Hệ quả

- **Điều kiện đảo ngược:** một khối vỡ thật sự giữa hai mốc (đo bằng checklist ở mục [Kiểm tra trước khi đăng](#kiểm-tra-trước-khi-đăng)) → thêm mốc cho riêng khối đó, hoặc dùng container query (RD-007), trước khi thêm mốc toàn trang.

## RD-002: Lưới và container

### Quyết định

| | Mobile | Tablet | Laptop |
| --- | --- | --- | --- |
| Số cột | 4 | 8 | 12 |
| Gutter | 16 | 24 | 24 |
| Lề hai bên | 24; 16 khi hẹp hơn 360 | 48 | Tối thiểu 32 |
| Nội dung rộng nhất | Toàn chiều ngang trừ lề | Toàn chiều ngang trừ lề (672 ở 768) | 1200, căn giữa |
| Cột đọc bài viết | Toàn chiều ngang trừ lề | Toàn chiều ngang trừ lề | 720, căn giữa |
| Khoảng cách giữa section | 48 (`space-2xl`) | 64 (`space-3xl`) | 96 trang chủ (`space-4xl`), 64 trang trong |

- **Tablet dùng 8 cột** để các tỉ lệ của laptop còn chia đều: hero 8/4 thành 5/3, lưới 2 cột giữ nguyên 2 cột.
- Container: `width: min(1200px, 100% - 2 × lề)`, căn giữa.

### Hệ quả

- Khoảng 1024 đến 1200: lề giữ 32, nội dung co theo màn hình, lưới vẫn 12 cột.
- **Điều kiện đảo ngược:** thêm trang dạng dashboard hoặc gallery → dùng `container-wide` 1440 của design system cho riêng trang đó, không đổi container chung.

## RD-003: Cỡ chữ — chỉ tiêu đề co giãn

### Quyết định

| Vai trò | 390 | 768 | 1280 | CSS |
| --- | --- | --- | --- | --- |
| `h1` tiêu đề trang | 32 | 43 | 48 | `clamp(2rem, 1.25rem + 3vw, 3rem)` |
| `h2` tiêu đề section | 24 | 30 | 32 | `clamp(1.5rem, 1.1rem + 1.6vw, 2rem)` |
| `h4` tiêu đề dự án nổi bật | 20 | 23 | 24 | `clamp(1.25rem, 1.05rem + 0.8vw, 1.5rem)` |
| Tiêu đề bài trong danh sách | 20 | 22 | 22 | `1.25rem`, `1.375rem` từ 768 |
| Mục của thân bài: `h3` trong case study, `h2` trong bài viết | 20 | 23 | 24 | `--fs-h4` |
| Chữ thân bài: bài viết và case study (Vấn đề, Kết quả, thân bài) | 16 | 16 | 16 | `--fs-body`, line-height 1.75; bốn phần của quyết định là chữ in đậm cùng cỡ |
| Chữ dẫn (`body-lg`) | 18 | 18 | 18 | `1.125rem` |
| Chữ UI (`body`) | 16 | 16 | 16 | `1rem` |
| Code trong khối | 13 | 14 | 14 | `0.8125rem`, `0.875rem` từ 768 |

- `h1` đạt 48 từ khoảng 933 trở lên, nên ở laptop luôn là 48.
- Mọi cỡ chữ dùng `rem` để người đọc phóng to được. Design system đặt mục tiêu 60–75 ký tự mỗi dòng với cột 720; số ký tự thật ở cỡ 16 chưa đo (xem [Điểm chưa kiểm chứng](#điểm-chưa-kiểm-chứng)).
- Văn bản dài không được đẩy trang rộng ra: thân bài dùng `overflow-wrap: break-word`, code nội dòng và URL dài dùng `overflow-wrap: anywhere`.

### Các phương án

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| **Chỉ tiêu đề co giãn (chọn)** | Chữ để đọc ổn định; tiêu đề không chiếm nửa màn hình mobile | Hai cách định cỡ cùng tồn tại |
| Mọi cỡ chữ co giãn | Một công thức cho tất cả | Thân bài nhỏ đi trên mobile, đúng nơi cần đọc dễ nhất |
| Cỡ cố định, đổi theo breakpoint | Dễ đoán | Tiêu đề nhảy cỡ đột ngột ở 768 và 1024 |

### Hệ quả

- **Để kiểm chứng:** phần `vw` trong `clamp()` không tăng theo zoom trình duyệt. Cần đo tiêu đề ở zoom 200% (xem [Spike kiểm chứng](#spike-kiểm-chứng)).

## RD-004: Điều hướng và tương tác

### Quyết định

- **Không hamburger, không menu ẩn.** Logo và 3 mục (Dự án, Blog, Giới thiệu) vừa một dòng tới 320. Header cao 56 trên mobile, 72 từ 768.
- **Logo dưới 768 chỉ còn mark (28/09/2026).** Lockup đủ của design system (mark 20, wordmark 18) cộng 3 mục cỡ 16 đè lên nhau dưới khoảng 380, nên dưới 768 header chỉ hiện mark `<SJ/>` cao 20; từ 768 hiện mark 24 cạnh wordmark 22. Link logo vẫn mang tên "SoJDev, về trang chủ" qua `aria-label`. Chọn bỏ wordmark thay vì thêm mốc ở 380, vì RD-001 chỉ có hai mốc.
- **Vùng chạm tối thiểu 44 × 44** cho mọi điều khiển độc lập: link điều hướng, nút, nút lọc chủ đề, link "Xem dự án →". Ngoại lệ có chủ ý: chip tag nằm trong dòng meta của bài cao 28, vẫn đạt mức tối thiểu 24 của WCAG 2.5.8.
- **Không thông tin nào chỉ xuất hiện khi rê chuột.** Hover chỉ đổi màu.
- **Chiều cao theo nội dung.** Không section nào đặt chiều cao theo viewport (`100vh`, `100dvh`). Khi điện thoại xoay ngang (844 × 390), hero vẫn hiện đủ tiêu đề và nút.

### Các phương án

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| **3 mục luôn hiện (chọn)** | Không JS; người đọc thấy ngay có gì trên site | Chỉ đúng khi còn 3 mục |
| Hamburger trên mobile | Chứa được nhiều mục | Cần JS hoặc mẹo CSS; giấu điều hướng sau một lần bấm |

### Hệ quả

- **Điều kiện đảo ngược:** thêm mục thứ tư (IA-004) → đo lại ở 320 trước. Nếu không vừa, rút gọn nhãn trước khi cân nhắc menu ẩn.

## RD-005: Sắp xếp lại từng khối

### Quyết định

**Cùng nội dung, cùng thứ tự ở mọi kích thước.** Không ẩn khối nào trên mobile. Thứ tự trong HTML là thứ tự đọc trên mobile; ở màn rộng, grid chỉ đổi vị trí, không đổi thứ tự trình đọc màn hình đọc.

| Khối | Laptop | Tablet | Mobile |
| --- | --- | --- | --- |
| Header | Mark và wordmark trái, 3 mục phải, cao 72 | Như laptop | Cao 56, chỉ còn mark, vẫn đủ 3 mục |
| Hero trang chủ | Chữ 8 cột, ảnh chân dung 4 cột, tỉ lệ 4:5 | Chữ 5 cột, ảnh 3 cột | Chữ và nút trước, ảnh sau, cắt 4:3 |
| Dự án nổi bật | Ảnh 7 cột cạnh chữ 5 cột | Ảnh trên, chữ dưới | Như tablet; bảng Vấn đề, Quyết định xếp nhãn trên nội dung |
| Dự án phụ, danh sách chủ đề | 2 cột | 2 cột | 1 cột |
| Trang `/projects/` | So le: ảnh trái rồi ảnh phải | Xếp chồng, ảnh luôn ở trên | Như tablet |
| Bài viết mới (trang chủ) | Cột chủ đề 320 cạnh danh sách bài | Chủ đề thành một hàng nút phía trên danh sách | Như tablet, nút xuống dòng khi hết chỗ |
| Khối liên hệ | Chữ trái, 3 nút phải | Chữ trên, 3 nút một hàng dưới | Nút Email toàn chiều ngang; LinkedIn và GitHub chia đôi hàng dưới |
| `/blog/` theo năm | Cột năm 200 cạnh danh sách | Cột năm 120 | Năm thành tiêu đề phía trên nhóm bài |
| Nút lọc chủ đề | Một hàng | Xuống dòng khi hết chỗ | Xuống dòng; không cuộn ngang để không giấu chủ đề |
| Bài viết | Cột 720 căn giữa | Toàn chiều ngang trừ lề | Như tablet; tag xuống dòng dưới ngày đăng |
| Khối code | Cuộn ngang bên trong khối | Như laptop | Cuộn ngang, tràn sát mép màn hình, không bo góc |
| Thẻ dự án liên quan | Ảnh 200 cạnh chữ | Như laptop | Ảnh trên, chữ dưới khi thẻ hẹp hơn 480 (RD-007) |
| Case study | Nội dung cạnh mục lục 272 cố định trong màn hình; thông tin 4 cột; quyết định 1 cột ở 1024, 2 × 2 từ khoảng 1040 | Không có mục lục trong trang; nút nổi icon hamburger mở mục lục thành bảng nổi; thông tin 2 cột, quyết định 2 × 2 | Như tablet; thông tin 1 cột, quyết định 1 cột |
| Bảng trong `.prose` | Bảng, cuộn ngang bên trong khi quá rộng | Như laptop | Cột chữ hẹp hơn 36rem: mỗi dòng thành một khối, ô đầu làm tên khối, các ô sau có nhãn cột |
| `/about/` | Bố cục hồ sơ GitHub: cột hồ sơ 296 (ảnh tròn, tên, nút Email, thông tin kèm icon) cạnh tiêu đề và nội dung | Như laptop, cột hồ sơ 240 | Tiêu đề và chữ dẫn, rồi ảnh tròn 96 cạnh tên, nút Email và thông tin, rồi nội dung |
| Footer | Một hàng, cao 160 | Xếp chồng | Xếp chồng, link xuống dòng khi hết chỗ |

**Thứ tự HTML cần chú ý:** trên `/about/`, tiêu đề "Giới thiệu" và chữ dẫn đứng trước khối hồ sơ trong HTML, rồi tới nội dung. Từ 768, grid đặt hồ sơ vào cột trái bằng `grid-column`, không bằng `order`. Nội dung theo thứ tự: khung "Tôi làm gì" kiểu README, dự án tiêu biểu, cách làm việc (thẻ), học vấn mới nhất trước (29/09/2026).

**Trang không bao giờ cuộn ngang.** Khối `<pre>` được cuộn ngang bên trong: WCAG 1.4.10 miễn trừ nội dung cần bố cục hai chiều, và tài liệu giải thích của W3C nêu khối code là ví dụ. Trên mobile, thụt lề trong code mẫu dùng 2 dấu cách để giảm cuộn ngang.

### Hệ quả

- **Khó hơn:** mỗi khối có tối đa ba bố cục phải giữ đồng bộ.
- **Bảng xếp thành khối khi hẹp (28/09/2026).** Bảng 3 cột trong cột 288 chỉ còn khoảng 100 px mỗi cột: bảng "Đối chiếu kết quả" của case study `sojdev-site` ở 320 có dòng cao 460 px, mỗi dòng chữ một hai từ. Cuộn ngang không cứu được vì chữ vẫn ngắt theo cột. Khi cột chữ hẹp hơn 36rem, mỗi dòng thành một khối, ô đầu làm tên khối, các ô sau mang nhãn cột. Nhãn lấy từ `<th>` lúc build (`src/lib/markdown-tables.ts` gắn `data-label`), nên không cần JavaScript; bảng cũng được gắn role ARIA tường minh để trình đọc màn hình vẫn đọc tên cột khi `display` đổi. Bảng rộng hơn 36rem giữ dạng bảng và cuộn ngang bên trong như khối code.
- **Hero trang chủ 8/4 thay 7/5 (28/09/2026).** Chiều cao hero do ảnh chân dung 4:5 quyết định. Ở 7/5 ảnh rộng 473 nên hero cao 592, khối chữ chỉ khoảng 270 và hở khoảng 160 mỗi phía; ở 1280 × 800 hero kết thúc ở y 761, tiêu đề "Dự án tiêu biểu" ở y 857, nên người đến từ CV không thấy dự án nào khi chưa cuộn. Ở 8/4 ảnh còn khoảng 379 × 473 và tiêu đề đó nằm trong màn hình đầu.
- **Mục lục case study dưới 1024 là bảng nổi (28/09/2026).** Từ 1024 mục lục là cột phải cố định trong màn hình. Dưới 1024 không có chỗ cho cột đó, nên mục lục không nằm trong dòng đọc mà mở từ nút nổi tròn 44 × 44 có icon hamburger ở góc dưới phải (tên cho trình đọc màn hình là "Mục lục"; `position: fixed`, nên nút luôn ở góc màn hình kể cả khi cuộn tới footer; footer của trang case study có thêm padding dưới 76 px để hàng link cuối không nằm dưới nút). Không có JavaScript: nút trỏ tới `#toc`, `:target` hiện mục lục thành bảng neo ở góc dưới phải trên một lớp nền mờ, và khoá cuộn trang phía sau (`html:has(#toc:target)`). Chọn một mục thì URL đổi sang mục đó nên bảng tự đóng; "Đóng" và bấm vào nền mờ trỏ tới `#dong-muc-luc`, một fragment không có phần tử, nên bảng đóng mà trang không cuộn. Lớp nổi phủ `--surface` lên `--bg` vì `--surface` của theme tối trong suốt 80%. Cái giá: mỗi lần mở hay đóng thêm một mục vào lịch sử trình duyệt, nút Back có thể mở lại bảng; phím Esc không đóng bảng. Stop rule "không menu ẩn" của RD-004 nói về điều hướng chính của site (header), không phải mục lục trong trang; header vẫn đủ 3 mục ở mọi độ rộng.

## RD-006: Ảnh

### Quyết định

- **Mọi ảnh giữ chỗ trước khi tải:** có `width` và `height` (hoặc `aspect-ratio`) để trang không nhảy.
- **Nhiều kích thước:** xuất các cỡ 400, 800, 1200, 1600; `sizes` phải khớp độ rộng cột thật ở từng khoảng. Dùng `<Image>` và `<Picture>` của `astro:assets`, thuộc tính `layout` để Astro sinh `srcset` và `sizes`; ghi đè `sizes` khi ảnh nằm trong lưới hẹp hơn chiều ngang trang.
- **Ảnh chụp dự án chỉ có bản desktop, thu nhỏ ở mọi độ rộng.** Dưới 768 và trong thẻ dự án liên quan (200 đến khoảng 340), chữ trong ảnh không đọc được, nhưng ảnh chỉ cần cho nhận ra bố cục trang của dự án; chữ đọc được đã có ở phần mô tả bên cạnh. Trước đó dùng ảnh chụp giao diện mobile riêng dưới 768; bỏ vì thêm một file phải chụp và giữ khớp cho mỗi dự án mà không đổi được gì người đọc cần (28/09/2026). Ảnh chụp giao diện có viền 1px và shadow (`frame`), vì nền của ảnh trùng nền trang nên không có mép. Chế độ tối thêm quầng `--primary-tint`, vì bóng đen không hiện trên nền gần đen. Ảnh ở khối dự án tiêu biểu là link tới case study, bỏ khỏi thứ tự tab vì trùng link tiêu đề. Khối không có link chữ "Đọc case study" để thân khối vừa chiều cao ảnh; thay vào đó tiêu đề có mũi tên màu link, và hover ảnh hay tiêu đề thì cả hai cùng sáng: shadow đậm hơn, viền ảnh và tiêu đề đổi màu link, mũi tên nhích sang phải (28/09/2026).
- **Ảnh chụp dự án có bản tối (tuỳ chọn).** Khai báo ở `screenshot.light` và `screenshot.dark`; `ImageSlot` thêm `<source media="(prefers-color-scheme: dark)">`, nên ảnh đổi theo chế độ màu giống phần còn lại của trang, không cần JavaScript. `<Picture>` của Astro 7.3.5 chỉ nhận một ảnh nguồn nên `ImageSlot` tự dựng `<picture>` bằng `getImage()`. Dự án không có giao diện tối thì bỏ trống, ảnh sáng dùng cho cả hai chế độ. Một cặp ảnh 16:10 dùng cho mọi nơi, kể cả đầu case study (khung rộng tới 1200, nên file 2400 × 1500 đủ nét trên retina); trước đó đầu case study dùng khung 2:1 với file riêng 2400 × 1200, bỏ vì mỗi dự án phải chụp hai bộ ảnh khác tỉ lệ và khung 2:1 cắt mất nội dung. Hai bản chụp cùng khung: viewport 1280 × 800, tỉ lệ điểm ảnh 1.875 (28/09/2026).
- **Ảnh chân dung** dùng một file tỉ lệ 4:5; trên mobile cắt 4:3 bằng `object-fit: cover` căn trên, không cần file thứ hai.
| Ảnh | Kích thước gốc cần chuẩn bị |
| --- | --- |
| Chân dung | 880 × 1100 |
| Ảnh chụp dự án (sáng, tối) | 2400 × 1500 |

### Hệ quả

- Tối ưu ảnh lúc build cũng là bước đầu trong stress test băng thông của architecture.md.

## RD-007: Component dùng lại — container query

### Quyết định

Component xuất hiện ở nhiều độ rộng cột đổi bố cục theo **độ rộng của chính nó**, bằng container query:

- **Thẻ dự án liên quan:** ảnh cạnh chữ khi thẻ rộng từ 480; ảnh trên, chữ dưới khi hẹp hơn.
- **Case study (28/09/2026):** từ 1024 cột nội dung hẹp lại vì có mục lục bên phải, nên số cột theo độ rộng cột chứ không theo viewport. Thông tin: 1 cột dưới 30rem, 2 cột từ 30rem, một hàng từ 56rem. Thẻ quyết định và bài viết: 1 cột dưới 40rem, 2 cột từ 40rem. Padding thẻ quyết định và khung Kết quả 16 dưới 30rem, để cột chữ ở 320 không còn khoảng 240 px.
- **Bảng trong `.prose`:** xếp thành khối khi cột chữ hẹp hơn 36rem (RD-005).
- Bố cục cấp trang (hero, lưới, header) vẫn dùng media query theo RD-001.

### Các phương án

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| **Container query cho component dùng lại (chọn)** | Component đúng ở mọi nơi đặt nó, không cần biết trang | Thêm một khái niệm cần nhớ |
| Media query cho mọi thứ | Một cơ chế duy nhất | Thẻ đặt trong cột hẹp trên laptop vẫn giữ bố cục ngang |

### Hệ quả

- **Điều kiện áp dụng thêm:** một component thứ hai được dùng ở hai độ rộng cột khác nhau → chuyển nó sang container query.

## CSS nền

Điểm bắt đầu cho `src/styles/`. Giá trị lấy từ bảng RD-002 và RD-003; tên biến màu và font vẫn theo design system.

```css
:root {
  --page-margin: 1rem;
  --gutter: 1rem;
  --container: 75rem;      /* 1200 */
  --measure: 45rem;        /* 720, cột đọc */
  --section-gap: 3rem;     /* space-2xl */
  --header-h: 3.5rem;      /* 56 */
 
  --fs-h1: clamp(2rem, 1.25rem + 3vw, 3rem);
  --fs-h2: clamp(1.5rem, 1.1rem + 1.6vw, 2rem);
  --fs-h4: clamp(1.25rem, 1.05rem + 0.8vw, 1.5rem);
  --fs-post-title: 1.25rem;
  --fs-code: 0.8125rem;
}
 
@media (min-width: 360px) {
  :root { --page-margin: 1.5rem; }
}
 
@media (min-width: 768px) {
  :root {
    --page-margin: 3rem;
    --gutter: 1.5rem;
    --section-gap: 4rem;   /* space-3xl */
    --header-h: 4.5rem;    /* 72 */
    --fs-post-title: 1.375rem;
    --fs-code: 0.875rem;
  }
}
 
@media (min-width: 1024px) {
  :root { --page-margin: 2rem; }
}
 
.container {
  width: min(var(--container), 100% - 2 * var(--page-margin));
  margin-inline: auto;
}
 
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: var(--gutter);
}
@media (min-width: 768px) { .grid { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(12, minmax(0, 1fr)); } }
 
.related-card { container-type: inline-size; }
@container (min-width: 480px) {
  .related-card__body { grid-template-columns: 200px minmax(0, 1fr); }
}
```

Trang chủ ghi đè `--section-gap: 6rem` (`space-4xl`) từ 1024.

## Token trong design system

Các giá trị của tài liệu này đã có trong design system SoJDev từ 27/09/2026. Khi code, đọc giá trị từ token, không chép số tay.

| Giá trị | Token | Nhóm |
| --- | --- | --- |
| Breakpoint 768, 1024 | `breakpoint-tablet`, `breakpoint-laptop` | `layout` |
| Số cột 4 / 8 / 12 | `grid-columns-mobile`, `grid-columns-tablet`, `grid-columns` | `layout` |
| Gutter 16 / 24 | `grid-gutter-mobile`, `grid-gutter` | `layout` |
| Lề trang 16 / 24 / 48 / 32 | `page-margin-narrow`, `page-margin-mobile`, `page-margin-tablet`, `page-margin-laptop` | `layout` |
| Cột đọc 720 | `measure` | `layout` |
| Header 56 / 72 | `header-height-mobile`, `header-height` | `layout` |
| Vùng chạm 44 | `touch-target` | `layout` |
| Tiêu đề co giãn | `fs-h1`, `fs-h2`, `fs-h4` | `fluidType` |
| Thân bài 16, line-height 1.75 | style `prose` (từ 17 xuống 16 ngày 28/09/2026 để bài viết và case study cùng cỡ) | `type` |
| `h2` 32 trên laptop | style `h2` (600, -0.01em) | `type` |
| Khoảng cách section 48 / 64 / 96 | `space-2xl`, `space-3xl`, `space-4xl` (usage đã ghi theo khoảng) | `spacing` |

**Hai điểm cần biết:**

- Style chữ trong design system chỉ nhận cỡ cố định, nên `h1`, `h2`, `h4` ghi cỡ ở laptop; cỡ co giãn nằm ở nhóm `fluidType`. Trong CSS dùng `var(--fs-h1)`, không dùng cỡ của style.
- `h2` và `h3` giờ cùng cỡ 32. `h3` chỉ còn dùng cho số lớn của StatCard.

## Kiểm tra trước khi đăng

Chiều rộng cần mở: 320, 360, 390, 768, 1024, 1280, 1440, và 844 × 390 (điện thoại xoay ngang).

- [ ] Ở 320 không có cuộn ngang ở cấp trang (WCAG 1.4.10).
- [ ] Phóng to chữ 200% không mất nội dung hay chức năng (WCAG 1.4.4).
- [ ] Header vừa một dòng ở 320.
- [ ] Mọi điều khiển độc lập có vùng chạm từ 44 × 44.
- [ ] Thứ tự Tab khớp thứ tự nhìn thấy ở cả ba khoảng.
- [ ] Không ảnh nào làm trang nhảy khi tải (CLS).
- [ ] Cả chế độ sáng và tối.

## Stop rules

- Không hamburger khi còn 3 mục điều hướng (RD-004).
- Không breakpoint bố cục thứ ba cho toàn trang (RD-001).
- Không ẩn nội dung theo kích thước màn hình (RD-005).
- Không đặt chiều cao section theo viewport (RD-004).
- Không cỡ chữ thân bài hay chữ UI dưới 16 (RD-003).
- Không dùng JavaScript để đổi bố cục.
- Không URL hay bản site riêng cho mobile.

## Stress test

- **Tiêu đề bài dài ở 320:** `h1` 32 trên cột 288 chứa khoảng 16 ký tự mỗi dòng (ước lượng). Tiêu đề hiện có dài nhất, 55 ký tự, chiếm khoảng 4 dòng. Tiêu đề trên khoảng 80 ký tự sẽ vượt 5 dòng; khi đó rút gọn tiêu đề trước khi giảm cỡ chữ.
- **Slug tag dài nhất trong danh sách, `/tags/requirements-engineering/` ở 320:** khoảng 31 ký tự mono cỡ 13, vừa trong 288.
- **URL dài không có dấu cách trong bài:** `overflow-wrap: anywhere` ngắt dòng thay vì đẩy trang rộng ra.
- **Mục điều hướng thứ tư:** xem điều kiện đảo ngược của RD-004.

## Spike kiểm chứng

Gộp vào spike "Đo baseline" của architecture.md:

- [ ] Chạy Lighthouse chế độ mobile trên trang chủ và một bài viết, trước khi thêm island nào.
- [ ] Đo `h1`, `h2` ở zoom 200% trên laptop 1280; xác nhận chữ vẫn đạt yêu cầu của WCAG 1.4.4 dù phần `vw` không tăng theo zoom.
- [ ] Dựng thẻ dự án liên quan bằng container query; xác nhận đổi bố cục ở 480 khi đặt trong cột 720 và cột 342.
- [ ] Dựng một ảnh chụp dự án bằng `<picture>` có nguồn mobile; xác nhận trình duyệt tải đúng file ở 390 và 1280.

## Điểm chưa kiểm chứng

- `sizes` do `layout` của `astro:assets` tự sinh có khớp độ rộng cột trong lưới hay không, hay luôn phải ghi đè.
- Cách tốt nhất trên Astro v7 để làm ảnh khác nhau theo màn hình (art direction): `<Picture>` hỗ trợ trực tiếp, hay phải dựng `<picture>` bằng tay với `getImage()`.
- Số ký tự mỗi dòng thật của Geist cỡ 16 trong cột 720, so với mục tiêu 60–75 của design system.
- Tỉ lệ thiết bị thật của người đọc (xem Drivers).

## Nguồn

- [Understanding SC 1.4.10: Reflow — W3C](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Understanding SC 1.4.4: Resize Text — W3C](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [Understanding SC 2.5.8: Target Size (Minimum) — W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Images — Astro Docs](https://docs.astro.build/en/guides/images/)
- [CSS container queries — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [clamp() — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
