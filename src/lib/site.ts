/** Thông tin dùng chung cho header, footer, khối liên hệ, metadata và JSON-LD. */
export const SITE = {
  name: "SoJDev",
  author: "Lê Hoàng Lâm",
  jobTitle: "Software Engineer",
  // Sidebar trang Giới thiệu và JSON-LD `Person`.
  location: "TP. Hồ Chí Minh",
  school: "Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM",
  // Nút "Tải CV" trang Giới thiệu chỉ bật khi file này có trong public/.
  cv: "/cv.pdf",
  locale: "vi-VN",
  // Câu định vị nằm ở `description` của src/content/pages/vi/home.md (IA-008).
} as const;

/**
 * Kênh liên hệ (IA-004: footer, khối liên hệ trang chủ, trang Giới thiệu).
 */
export const CONTACT = {
  email: "lhlam2515@gmail.com",
  linkedin: {
    url: "https://www.linkedin.com/in/lhlam2515/",
    handle: "lhlam2515",
  },
  github: { url: "https://github.com/lhlam2515", handle: "lhlam2515" },
  rss: "/rss.xml",
} as const;

/** IA-004: đúng 3 mục, Dự án đứng trước. `match` là các tiền tố URL làm mục đó sáng. */
export const NAV = [
  { label: "Dự án", href: "/projects/", match: ["/projects/"] },
  { label: "Blog", href: "/blog/", match: ["/blog/", "/tags/"] },
  { label: "Giới thiệu", href: "/about/", match: ["/about/"] },
] as const;
