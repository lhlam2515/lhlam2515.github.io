import { existsSync } from "node:fs";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
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
        // Tag sẽ thành URL /tags/[tag], nên cũng phải là slug.
        tags: z.array(slugSchema).default([]),
        draft: z.boolean().default(false),
        cover: image().optional(),
      })
      .refine((post) => !post.updatedDate || post.updatedDate >= post.pubDate, {
        message: "updatedDate không được trước pubDate",
        path: ["updatedDate"],
      }),
});

// Cấu trúc problem → decisions → outcome là chủ ý (ADR-003): frontmatter giữ
// bản tóm tắt cho card/listing, thân Markdown giữ phần kể chi tiết.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects/vi", generateId: slugId() }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    slug: slugSchema,
    role: z.string(),
    stack: z.array(z.string()).min(1),
    problem: z.string(),
    decisions: z
      .array(
        z.object({
          title: z.string(),
          rationale: z.string(),
        }),
      )
      .min(1),
    outcome: z.string(),
    repoUrl: z.url().optional(),
    liveUrl: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number().int(),
  }),
});

export const collections = { blog, projects };
