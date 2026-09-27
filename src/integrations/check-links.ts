import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

/** Thuộc tính chứa URL; Astro luôn xuất giá trị trong dấu nháy kép. */
const URL_ATTR = /\s(?:href|src)="([^"]*)"/g;

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith(".html") ? [path] : [];
  });
}

/**
 * Kiểm tra link nội bộ trong `dist/` sau khi build (quality gate của ADR-005).
 *
 * Hai lỗi làm build thất bại:
 * - Link tới file không tồn tại.
 * - Link tới trang mà thiếu dấu `/` cuối (IA-001). `trailingSlash` của Astro
 *   chỉ áp dụng cho dev server; trang prerender do host quyết định, nên quy ước
 *   phải được kiểm ở đây.
 *
 * Link ngoài không được kiểm: lỗi mạng hay rate limit của site khác không được
 * làm hỏng một lần deploy.
 */
export default function checkLinks(): AstroIntegration {
  return {
    name: "sojdev:check-links",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const errors: string[] = [];

        for (const file of htmlFiles(root)) {
          const page = "/" + relative(root, file);
          for (const [, raw] of readFileSync(file, "utf8").matchAll(URL_ATTR)) {
            // Link ngoài, anchor trong trang, mailto:, data: … đều bỏ qua.
            if (!raw.startsWith("/") || raw.startsWith("//")) continue;
            const path = decodeURI(raw.split(/[?#]/)[0]);
            const target = join(root, path);

            if (path.endsWith("/")) {
              if (!existsSync(join(target, "index.html"))) errors.push(`${page}: ${raw} không tồn tại`);
            } else if (extname(path) === "") {
              const hint = existsSync(join(target, "index.html")) ? `, dùng ${path}/` : " và không tồn tại";
              errors.push(`${page}: ${raw} thiếu dấu / cuối${hint}`);
            } else if (!existsSync(target)) {
              errors.push(`${page}: ${raw} không tồn tại`);
            }
          }
        }

        if (errors.length > 0) {
          throw new Error(`Có ${errors.length} link nội bộ hỏng:\n${errors.join("\n")}`);
        }
        logger.info("Link nội bộ: không có lỗi.");
      },
    },
  };
}
