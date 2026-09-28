import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type HastPluginEntry = NonNullable<SatteriProcessorOptions["hastPlugins"]>[number];

/**
 * IA-007: trang case study chia hai phần "Tóm tắt" và "Chi tiết" ở cấp h2, và
 * thân bài nằm trong phần "Chi tiết". Tác giả vẫn viết `##` cho mỗi mục
 * (assertDecisionSections() đọc `##` trong Markdown thô); lúc render chúng hạ
 * thành h3, để không mục nào cùng cấp với phần chứa nó. Thân bài không có
 * `###` (cũng do assertDecisionSections() chặn), nên chỉ cần hạ h2.
 *
 * Plugin chạy trước plugin heading id của Astro, nên `headings` của render()
 * mang cấp đã hạ. Chỉ áp cho collection `projects`; bài blog giữ nguyên cấp.
 */
export const caseStudyHeadings: HastPluginEntry = (ctx) =>
  ctx.fileURL?.pathname.includes("/src/content/projects/") && {
    name: "case-study-headings",
    element: {
      filter: ["h2"],
      visit(node, visitor) {
        visitor.replaceNode(node, { ...node, tagName: "h3" });
      },
    },
  };
