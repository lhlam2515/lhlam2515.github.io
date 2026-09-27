// @ts-check
import { defineConfig } from "astro/config";
import checkLinks from "./src/integrations/check-links.ts";

// Domain không nằm trong code: ở CI, SITE_URL lấy từ `actions/configure-pages`,
// tức là theo mục Custom domain trong Settings → Pages. Đổi domain chỉ cần đổi
// ở đó rồi build lại. Build cục bộ không có SITE_URL thì dùng localhost.
const site = process.env.SITE_URL;
if (!site && process.env.CI) {
  throw new Error("Thiếu SITE_URL: CI phải truyền origin từ actions/configure-pages.");
}

// https://astro.build/config
export default defineConfig({
  site: site ?? "http://localhost:4321",
  // IA-001: URL luôn có dấu / cuối, output là thư mục chứa index.html. Hai
  // tuỳ chọn này chỉ ràng buộc dev server và Astro.url; link trong HTML đã
  // build được kiểm bởi checkLinks().
  trailingSlash: "always",
  build: { format: "directory" },
  // Mặc định Astro chỉ cảnh báo khi hai route cùng sinh một URL rồi âm thầm
  // chọn một bên. URL là thứ bất biến (ADR-006), nên trùng phải làm build
  // thất bại. Slug trùng trong content được chặn riêng ở src/content.config.ts.
  prerenderConflictBehavior: "error",
  integrations: [checkLinks()],
});
