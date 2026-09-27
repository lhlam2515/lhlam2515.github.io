---
title: "Tiếng Việt ở gốc URL: chốt gì ngay, để gì về sau"
description: "Site chưa có bản tiếng Anh, nhưng URL là thứ đắt nhất để đổi. Đây là những gì tôi chốt từ ngày đầu để sau này thêm tiếng Anh mà không URL nào phải đổi."
slug: tieng-viet-o-goc-url
pubDate: 2026-09-27
tags: [i18n, astro, seo]
---

Blog này viết bằng tiếng Việt. Tiếng Anh có thể đến sau, khi tôi đã có thói quen viết đều. Nghe thì có vẻ chưa cần nghĩ tới chuyện đa ngôn ngữ. Nhưng có một thứ không thể để sau: URL.

URL đã bị Google index và được chia sẻ đi thì đổi rất đắt. Site host trên GitHub Pages, nơi không có redirect phía server, nên đổi URL gần như đồng nghĩa với link hỏng. Vì vậy tôi chia quyết định thành ba nhóm: chốt ngay, để sau, và không làm kể cả khi đã song ngữ.

## Chốt ngay

**Tiếng Việt nằm ở gốc, không có tiền tố `/vi/`.** Bài viết ở `/blog/kien-truc-jamstack/`, không phải `/vi/blog/kien-truc-jamstack/`. Khi thêm tiếng Anh, bản dịch nằm dưới `/en/`. Astro hỗ trợ đúng mô hình này: với `prefixDefaultLocale: false` (mặc định), ngôn ngữ mặc định không có tiền tố, các ngôn ngữ khác thì có ([Astro i18n](https://docs.astro.build/en/guides/internationalization/)). Nhờ đó thêm tiếng Anh chỉ là cộng thêm, không đụng gì tới URL tiếng Việt đang có.

Phương án tiền tố cho mọi ngôn ngữ (`/vi/` và `/en/`) nhìn đối xứng hơn, nhưng phải cấu hình thêm để URL không tiền tố không trả 404, và tất cả chỉ để phục vụ một ngôn ngữ chưa tồn tại.

**Slug là ASCII không dấu.** "Kiến trúc JAMstack" thành `kien-truc-jamstack`. Cách làm: chuẩn hoá Unicode về dạng NFD để tách chữ và dấu, bỏ các dấu kết hợp, rồi chuyển hết về chữ thường.

```ts
export function slugify(input: string): string {
  return input
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

Dòng đầu tiên là chỗ dễ sai nhất. `đ` không phải chữ `d` cộng một dấu. Trong Unicode nó là một chữ cái riêng (U+0111), nên NFD không tách được, và nếu không xử lý riêng thì "Đường đi" sẽ thành `uong-i`.

Quy ước thôi thì chưa đủ, vì sớm muộn tôi cũng sẽ gõ nhầm một slug có dấu. Nên slug được kiểm tra bằng regex trong schema của content collection. Slug sai thì build thất bại, bài lỗi không lên site.

Còn việc slug không đổi sau khi đăng, kể cả khi tôi sửa tiêu đề, là kỷ luật tôi tự giữ. Không có gì trong code chặn chuyện đó: build chỉ chặn slug sai định dạng hoặc bị trùng, không chặn được việc tôi đổi ý.

**File xếp theo ngôn ngữ ngay từ đầu.** Bài viết nằm trong `src/content/blog/vi/`. Thư mục `en/` sau này chỉ việc đặt cạnh, không phải di chuyển file cũ.

**Những chi tiết nhỏ:** `<html lang="vi">`, font có subset `vietnamese`, ngày định dạng qua `Intl.DateTimeFormat` theo locale thay vì viết tay.

## Để sau

Những thứ sau chỉ làm khi bật tiếng Anh: cấu hình `i18n`, thư mục `src/pages/en/`, từ điển chuỗi giao diện, trường `translationKey` để ghép bản gốc với bản dịch, `hreflang`, RSS và sitemap theo ngôn ngữ.

Không cái nào trong số này làm đổi URL hiện có, nên để sau không tốn gì.

## Không làm, kể cả khi đã song ngữ

**Fallback kiểu rewrite.** Tức là khi bài chưa có bản tiếng Anh, hiển thị nội dung tiếng Việt ngay tại URL `/en/...`. Kết quả là trùng nội dung và thuộc tính `lang` sai. Thay vào đó, `/en/blog/` chỉ liệt kê bài đã dịch, và nút chuyển ngôn ngữ chỉ hiện khi bản dịch tồn tại.

**Tự phát hiện ngôn ngữ trình duyệt.** `Astro.preferredLocale` chỉ có trên trang render theo yêu cầu. Site này tĩnh hoàn toàn, nên tính năng đó không có sẵn, và tôi cũng không muốn thêm JavaScript chỉ để đoán ngôn ngữ người đọc.

## Khi nào bật tiếng Anh

Song ngữ gần như nhân đôi công duy trì mỗi bài, nên tôi cần một điều kiện quan sát được thay vì cảm hứng. Ngưỡng cụ thể tôi chưa chốt, có thể là số bài đăng đều đặn trong một khoảng thời gian. Có một ngoại lệ: trang giới thiệu và dự án có thể cần tiếng Anh sớm hơn blog, vì một phần nhà tuyển dụng đọc tiếng Anh. Cấu trúc hiện tại cho phép dịch riêng các trang đó.
