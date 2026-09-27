import { SITE } from "./site";

const dateFormat = new Intl.DateTimeFormat(SITE.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "27 tháng 9, 2026". Ngày trong frontmatter là ngày thuần, nên định dạng theo UTC để không lệch múi giờ. */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** Giá trị cho thuộc tính `datetime` của `<time>`. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
