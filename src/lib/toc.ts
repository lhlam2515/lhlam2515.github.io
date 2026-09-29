/**
 * Dữ liệu cho TableOfContents (RD-004); trang dựng nó qua caseStudyToc() hoặc archiveToc().
 *
 * `count`: số bài của mục, hiện bên phải (mục lục năm/tháng của /blog/).
 * `open`: có thì phần thành `<details>` thu gọn được, mở sẵn khi `true`; tên
 * phần khi đó là nút mở/đóng thay vì link, vì link lồng trong nút không bấm
 * riêng được.
 */
export type TocItem = { id: string; text: string; num?: string; count?: number };
export type TocPart = { id: string; text: string; items: TocItem[]; count?: number; open?: boolean };
