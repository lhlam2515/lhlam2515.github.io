import type { MarkdownHeading } from "astro";
import type { Project } from "./content";
import type { TocItem, TocPart } from "./toc";

/*
 * Cấu trúc case study (IA-007): frontmatter là overview các quyết định, thân
 * bài là bằng chứng, mỗi quyết định một mục `##` cùng tên. Mọi chỗ đọc cấu
 * trúc đó (kiểm tra lúc build, số liệu /projects/, mục lục) dùng các hàm ở đây.
 */

/** Các mục `##` của thân case study không ứng với quyết định nào (IA-007). */
export const FIXED_SECTIONS = new Set(["Bối cảnh", "Đối chiếu kết quả", "Còn mở", "Điều tôi sẽ làm khác"]);

/** Các mục `##` của thân bài Markdown thô, theo thứ tự, kể cả mục trùng tên. */
export function bodySections(project: Project): { heading: string; content: string }[] {
  return (project.body ?? "")
    .split(/^## +/m)
    .slice(1)
    .map((s) => {
      const [heading, ...rest] = s.split("\n");
      return { heading: heading.trim(), content: rest.join("\n") };
    });
}

/**
 * IA-007: mỗi quyết định có bốn phần in đậm, nhưng build chỉ ép tên mục `##`,
 * không ép đủ bốn phần. Đếm quyết định có cả phần so sánh (**Phương án đã
 * cân nhắc.**) và phần đánh đổi (**Đánh đổi.**) để số trên /projects/ nói
 * thật: quyết định thiếu một trong hai thì tỉ lệ tụt, không bị che.
 */
export function countWeighedDecisions(project: Project): number {
  const sections = new Map(bodySections(project).map(({ heading, content }) => [heading, content]));
  return project.data.decisions.filter(({ title }) => {
    const section = sections.get(title) ?? "";
    return /^\*\*Phương án đã cân nhắc\.\*\*/m.test(section) && /^\*\*Đánh đổi\.\*\*/m.test(section);
  }).length;
}

/** Số thứ tự quyết định hiện trên thẻ và mục lục: "01", "02"… */
export const decisionNumber = (i: number) => String(i + 1).padStart(2, "0");

/** Mục của thân bài sau khi caseStudyHeadings hạ `##` thành h3. */
const bodyHeadings = (headings: MarkdownHeading[]) => headings.filter((h) => h.depth === 3);

/** Tên mục → id anchor, để thẻ quyết định link thẳng xuống bằng chứng. */
export function evidenceIds(headings: MarkdownHeading[]): Map<string, string> {
  return new Map(bodyHeadings(headings).map((h) => [h.text, h.slug]));
}

/**
 * IA-007: mục lục theo cây heading của trang, gồm các mục h3 của thân bài.
 * Quyết định hiện bằng `label` ngắn để mọi mục một dòng, nhịp đều nhau; tên
 * đầy đủ vẫn là heading ở đích.
 */
export function caseStudyToc(project: Project, headings: MarkdownHeading[], withPosts: boolean): TocPart[] {
  const { decisions } = project.data;
  const decisionIndex = new Map(decisions.map((d, i) => [d.title, i]));
  const detailItems: TocItem[] = bodyHeadings(headings).map((h) => {
    const i = decisionIndex.get(h.text);
    return i === undefined ? { id: h.slug, text: h.text } : { id: h.slug, text: decisions[i].label, num: decisionNumber(i) };
  });
  return [
    {
      id: "summary",
      text: "Tóm tắt",
      items: [
        { id: "problem", text: "Vấn đề" },
        { id: "decisions", text: "Quyết định" },
        { id: "outcome", text: "Kết quả" },
      ],
    },
    { id: "details", text: "Chi tiết", items: detailItems },
    ...(withPosts ? [{ id: "rel", text: "Bài viết về dự án này", items: [] }] : []),
  ];
}

/** Host và đường dẫn, bỏ `/` cuối: nhãn cho link bản chạy. */
export const hostLabel = (url: string) => new URL(url).host + new URL(url).pathname.replace(/\/$/, "");

/**
 * Repo trên GitHub hiện dạng `owner/repo` như cách dev gọi tên repo; host khác
 * giữ nguyên host để người đọc biết mã nằm ở đâu.
 */
export const repoLabel = (url: string) =>
  new URL(url).host === "github.com" ? hostLabel(url).replace(/^github\.com\//, "") : hostLabel(url);
