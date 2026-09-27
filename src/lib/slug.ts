import { z } from "astro/zod";

/** Chữ thường ASCII và số, ngăn cách bằng một dấu gạch ngang (ADR-006). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Chuyển chuỗi tiếng Việt thành slug ASCII: "Kiến trúc JAMstack" → "kien-truc-jamstack".
 *
 * `đ` phải thay trước khi chuẩn hoá: U+0111 là một chữ cái riêng chứ không phải
 * `d` + dấu kết hợp, nên NFD không tách được nó.
 */
export function slugify(input: string): string {
  return input
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug do tác giả khai báo; sai định dạng thì build thất bại thay vì sinh URL lạ. */
export const slugSchema = z
  .string()
  .regex(
    SLUG_PATTERN,
    "Slug chỉ gồm a-z, 0-9 và dấu '-' đơn (ví dụ: kien-truc-jamstack). Dùng slugify() trong src/lib/slug.ts để tạo từ tiêu đề.",
  );
