// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: `https://lhlam2515.github.io`,
  // Mặc định Astro chỉ cảnh báo khi hai route cùng sinh một URL rồi âm thầm
  // chọn một bên. URL là thứ bất biến (ADR-006), nên trùng phải làm build
  // thất bại. Slug trùng trong content được chặn riêng ở src/content.config.ts.
  prerenderConflictBehavior: "error",
});
