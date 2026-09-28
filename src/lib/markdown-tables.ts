import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";

type HastPlugin = Extract<NonNullable<SatteriProcessorOptions["hastPlugins"]>[number], { name: string }>;
type Node = { type: string; tagName?: string; children?: Node[] };

const elements = (node: Node, tagName: string) =>
  (node.children ?? []).filter((child) => child.type === "element" && child.tagName === tagName);

/**
 * RD-005: dưới 36rem, bảng trong `.prose` xếp mỗi dòng thành một khối (global.css).
 * Khi đó ô không còn nằm dưới tiêu đề cột, nên mỗi ô mang tên cột của nó trong
 * `data-label` để CSS in ra làm nhãn. Việc này chạy lúc build vì site không có
 * JavaScript phía client.
 *
 * Role ARIA được gắn tường minh vì một số trình duyệt bỏ ngữ nghĩa bảng khi
 * `display` của bảng đổi khỏi `table`; có role thì trình đọc màn hình vẫn đọc
 * được tiêu đề cột ở mọi độ rộng.
 */
export const responsiveTables: HastPlugin = {
  name: "responsive-tables",
  element: {
    filter: ["table"],
    visit(table, ctx) {
      const [thead] = elements(table, "thead");
      const headerRow = thead && elements(thead, "tr")[0];
      if (!headerRow) return;
      const labels = elements(headerRow, "th").map((th) => ctx.textContent(th as never).trim());

      ctx.setProperty(table, "role", "table");
      for (const group of [...elements(table, "thead"), ...elements(table, "tbody")]) {
        ctx.setProperty(group as never, "role", "rowgroup");
        for (const row of elements(group, "tr")) {
          ctx.setProperty(row as never, "role", "row");
          for (const th of elements(row, "th")) ctx.setProperty(th as never, "role", "columnheader");
          elements(row, "td").forEach((td, i) => {
            ctx.setProperty(td as never, "role", "cell");
            if (labels[i]) ctx.setProperty(td as never, "dataLabel", labels[i]);
          });
        }
      }
    },
  },
};
