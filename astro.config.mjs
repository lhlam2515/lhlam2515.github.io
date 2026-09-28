// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import checkLinks from "./src/integrations/check-links.ts";
import { responsiveTables } from "./src/lib/markdown-tables.ts";

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
  // Code trong bài có màu cho cả hai theme; nền khối code do .prose pre đặt
  // (bg-muted), dark đổi màu qua prefers-color-scheme trong global.css.
  // responsiveTables: bảng xếp thành khối trên màn hẹp mà vẫn giữ tên cột (RD-005).
  markdown: {
    processor: satteri({ hastPlugins: [responsiveTables] }),
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
  // Font của design system SoJDev: file variable lấy nguyên từ design system,
  // tự host thay vì Google Fonts để giữ đủ glyph tiếng Việt (ADR-006).
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Space Grotesk",
      cssVariable: "--font-display",
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      options: {
        variants: [{ src: ["./src/assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"], weight: "300 700", style: "normal" }],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Geist",
      cssVariable: "--font-body",
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      options: {
        variants: [{ src: ["./src/assets/fonts/Geist-VariableFont_wght.ttf"], weight: "100 900", style: "normal" }],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Cascadia Mono",
      cssVariable: "--font-mono",
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      options: {
        variants: [{ src: ["./src/assets/fonts/CascadiaMono-VariableFont_wght.ttf"], weight: "200 700", style: "normal" }],
      },
    },
  ],
  integrations: [
    mdx(),
    // Trang 404 không phải đích để index.
    sitemap({ filter: (page) => !page.endsWith("/404/") && !page.endsWith("/404.html") }),
    checkLinks(),
  ],
});
