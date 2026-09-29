import type { MarkdownHeading } from "astro";
import type { CollectionEntry } from "astro:content";
import { bodySections, FIXED_SECTIONS } from "./case-study";
import type { Post, Project, Tag } from "./content";
import { SLUG_PATTERN } from "./slug";

/*
 * Kiểm tra nội dung lúc build: những lỗi mà schema và Astro không tự chặn.
 * Mỗi hàm throw kèm đường dẫn file. Hàm truy vấn trong content.ts gọi chúng,
 * nên trang lấy dữ liệu qua các hàm đó thì không bỏ sót được kiểm tra nào.
 */

/**
 * Kiểm mọi tham chiếu của bài: tag phải được khai báo (IA-002), dự án liên
 * quan phải tồn tại (IA-003).
 *
 * `reference()` trong schema không làm việc này: Astro chỉ phát hiện tham
 * chiếu hỏng khi gọi getEntry()/getEntries(), và khi đó trả về `undefined`
 * thay vì báo lỗi. Hàm này chạy trong mọi lần build vì mọi trang đều lấy bài
 * qua getPublishedPosts().
 */
export function assertReferences(posts: Post[], tags: Tag[], projects: Project[]): void {
  const errors: string[] = [];
  for (const tag of tags) {
    if (!SLUG_PATTERN.test(tag.id)) errors.push(`Tag "${tag.id}" trong tags.yaml không phải slug hợp lệ.`);
  }
  const tagIds = new Set(tags.map((t) => t.id));
  const projectIds = new Set(projects.map((p) => p.id));
  for (const post of posts) {
    for (const { id } of post.data.tags) {
      if (!tagIds.has(id)) errors.push(`${post.filePath}: tag "${id}" chưa được khai báo trong src/content/tags/tags.yaml.`);
    }
    for (const { id } of post.data.relatedProjects ?? []) {
      if (!projectIds.has(id)) errors.push(`${post.filePath}: relatedProjects trỏ tới dự án "${id}" không tồn tại.`);
    }
  }
  if (errors.length > 0) throw new Error(`Tham chiếu nội dung hỏng:\n${errors.join("\n")}`);
}

/**
 * IA-007: mỗi quyết định trong frontmatter có một mục `##` cùng tên, cùng thứ
 * tự trong thân bài. Không kiểm thì hai bản lệch nhau mà build vẫn qua, như
 * bản đầu của case study `sojdev-site`.
 */
export function assertDecisionSections(projects: Project[]): void {
  const errors: string[] = [];
  for (const project of projects) {
    const headings = bodySections(project)
      .map((s) => s.heading)
      .filter((h) => !FIXED_SECTIONS.has(h));
    const titles = project.data.decisions.map((d) => d.title);
    // Bốn phần của quyết định là chữ in đậm, không phải heading: dưới mỗi mục
    // chỉ có một cấp chữ, và mục lục không phải lọc bỏ các phần lặp lại.
    const subheadings = [...(project.body ?? "").matchAll(/^#{3,6} +(.+?)\s*$/gm)].map((m) => m[1]);
    if (subheadings.length > 0) {
      errors.push(
        `${project.filePath}: thân case study chỉ dùng heading \`##\`; viết các phần nhỏ bằng chữ in đậm đầu đoạn.\n` +
          `  heading cấp sâu hơn: ${JSON.stringify(subheadings)}`,
      );
    }
    if (headings.join("\n") !== titles.join("\n")) {
      errors.push(
        `${project.filePath}: mục ## trong thân bài phải trùng tên và thứ tự với decisions[].title.\n` +
          `  decisions: ${JSON.stringify(titles)}\n  thân bài:  ${JSON.stringify(headings)}`,
      );
    }
  }
  if (errors.length > 0) throw new Error(`Case study lệch cấu trúc:\n${errors.join("\n")}`);
}

/**
 * IA-007: thân case study phải đã hạ cấp lúc render, mục `##` thành h3. Còn h2
 * nghĩa là plugin caseStudyHeadings không chạy, và khi đó `depth === 3` lại
 * bắt nhầm bốn phần của quyết định; trang cũng có h2 nằm trong h2 "Chi tiết".
 * Dừng thay vì dựng mục lục sai.
 */
export function assertCaseStudyHeadings(project: Project, headings: MarkdownHeading[]): void {
  const bodyTop = Math.min(...headings.map((h) => h.depth));
  if (headings.length > 0 && bodyTop !== 3) {
    throw new Error(
      `${project.filePath}: heading thân bài bắt đầu ở h${bodyTop}, cần h3 (IA-007). ` +
        "Plugin caseStudyHeadings trong astro.config.mjs không chạy; nếu vừa đổi astro.config.mjs, khởi động lại dev server.",
    );
  }
}

/** IA-008: trang chủ chỉ đọc frontmatter; chữ ở thân bài sẽ mất mà không ai biết. */
export function assertHomeBody(page: CollectionEntry<"home">): void {
  if (page.body?.trim()) throw new Error(`${page.filePath}: thân bài không được hiển thị; đưa nội dung vào frontmatter.`);
}

/**
 * IA-008: heading của các mục thuộc bố cục trong about.astro; heading trong
 * thân bài sẽ lệch cấp và lọt ra ngoài cấu trúc landmark của trang.
 */
export function assertAboutBody(page: CollectionEntry<"about">): void {
  const headings = [...(page.body ?? "").matchAll(/^#{1,6} +(.+?)\s*$/gm)].map((m) => m[1]);
  if (headings.length > 0) {
    throw new Error(`${page.filePath}: thân bài không dùng heading.\n  heading: ${JSON.stringify(headings)}`);
  }
}
