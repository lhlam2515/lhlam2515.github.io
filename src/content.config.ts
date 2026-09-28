import { existsSync } from "node:fs";
import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { slugSchema } from "./lib/slug";

/**
 * Dùng frontmatter `slug` làm id của entry và làm build thất bại khi hai file
 * trùng slug.
 *
 * Check trùng có sẵn của Astro dựa vào data store: loader xử lý các file song
 * song, nên trên store sạch (mọi lần build ở CI) nó không bắt được gì, kể cả
 * cảnh báo. Hàm này chạy đồng bộ cho từng file nên không bị race.
 */
function slugId() {
  const owners = new Map<string, string>();
  return ({ entry, base, data }: { entry: string; base: URL; data: Record<string, unknown> }) => {
    // Thiếu slug thì schema sẽ báo lỗi; id tạm lấy từ tên file.
    if (typeof data.slug !== "string") return entry;
    const owner = owners.get(data.slug);
    // Ở dev server, file cũ có thể đã bị đổi tên hoặc xoá.
    if (owner && owner !== entry && existsSync(new URL("./" + encodeURI(owner), base))) {
      throw new Error(`Slug "${data.slug}" bị trùng giữa ${owner} và ${entry}.`);
    }
    owners.set(data.slug, entry);
    return data.slug;
  };
}

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog/vi", generateId: slugId() }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        slug: slugSchema,
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        // IA-002: chỉ tag đã khai báo trong collection `tags`, 1–4 tag mỗi bài.
        // reference() chỉ đổi chuỗi thành { collection, id }; việc tag có tồn
        // tại hay không được kiểm trong getPublishedPosts() (src/lib/content.ts).
        tags: z.array(reference("tags")).min(1).max(4),
        // IA-003: lưu một chiều từ bài sang dự án; chiều ngược tính lúc build.
        relatedProjects: z.array(reference("projects")).optional(),
        draft: z.boolean().default(false),
        cover: image().optional(),
      })
      .refine((post) => !post.updatedDate || post.updatedDate >= post.pubDate, {
        message: "updatedDate không được trước pubDate",
        path: ["updatedDate"],
      }),
});

// IA-007: frontmatter là overview các quyết định; thân bài là bằng chứng.
// Giới hạn dưới loại câu khẩu hiệu, giới hạn trên giữ mỗi trường khoảng hai câu
// để thẻ quyết định trong lưới 2 × 2 (RD-005) vẫn đọc được. Zod đếm theo UTF-16,
// nên file phải lưu ở dạng NFC.
const text = (min: number, max: number) => z.string().min(min).max(max);

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects/vi", generateId: slugId() }),
  schema: z.object({
    title: z.string(),
    summary: text(80, 200),
    slug: slugSchema,
    role: z.string(),
    stack: z.array(z.string()).min(1),
    problem: text(150, 350),
    decisions: z
      .array(
        z.object({
          title: text(15, 70),
          // Nhãn trong mục lục của trang: một dòng ở cột mục lục 272 và ở 320 (IA-007).
          label: text(8, 28),
          rationale: text(120, 320),
        }),
      )
      .min(2)
      .max(4),
    outcome: text(150, 350),
    // `outcome` được cập nhật khi có số đo mới.
    updatedDate: z.coerce.date().optional(),
    repoUrl: z.url().optional(),
    liveUrl: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number().int(),
  }),
});

// IA-002: từ vựng tag có kiểm soát. Key trong YAML là slug tag (bất biến, là
// thuật ngữ tiếng Anh); nhãn hiển thị theo ngôn ngữ.
const tags = defineCollection({
  loader: file("src/content/tags/tags.yaml"),
  schema: z.object({
    label: z.object({ vi: z.string() }),
    description: z.string(),
    // Hiện thành nút lọc ở đầu /blog/ và trên trang chủ.
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, projects, tags };
