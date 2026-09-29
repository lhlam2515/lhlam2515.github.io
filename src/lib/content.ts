import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { SLUG_PATTERN } from "./slug";

export type Post = CollectionEntry<"blog">;
export type Project = CollectionEntry<"projects">;
export type Tag = CollectionEntry<"tags">;
export type TagWithCount = { tag: Tag; count: number };

/**
 * Kiểm mọi tham chiếu của bài: tag phải được khai báo (IA-002), dự án liên
 * quan phải tồn tại (IA-003).
 *
 * `reference()` trong schema không làm việc này: Astro chỉ phát hiện tham
 * chiếu hỏng khi gọi getEntry()/getEntries(), và khi đó trả về `undefined`
 * thay vì báo lỗi. Hàm này chạy trong mọi lần build vì mọi trang đều lấy bài
 * qua getPublishedPosts().
 */
function assertReferences(posts: Post[], tags: Tag[], projects: Project[]): void {
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

const byNewest = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/**
 * Bài đã đăng, mới nhất trước. Đây là hàm lọc draft dùng chung (IA-005):
 * /blog/, trang tag, bài liên quan, trang dự án và RSS đều đi qua đây.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const [all, tags, projects] = await Promise.all([
    getCollection("blog"),
    getCollection("tags"),
    getCollection("projects"),
  ]);
  // Kiểm cả bài draft: draft cũng phải hợp lệ trước khi được đăng.
  assertReferences(all, tags, projects);
  return all.filter((post) => !post.data.draft).sort(byNewest);
}

/** Các mục `##` của thân case study không ứng với quyết định nào (IA-007). */
const FIXED_SECTIONS = new Set(["Bối cảnh", "Đối chiếu kết quả", "Còn mở", "Điều tôi sẽ làm khác"]);

/**
 * IA-007: mỗi quyết định trong frontmatter có một mục `##` cùng tên, cùng thứ
 * tự trong thân bài. Không kiểm thì hai bản lệch nhau mà build vẫn qua, như
 * bản đầu của case study `sojdev-site`.
 */
function assertDecisionSections(projects: Project[]): void {
  const errors: string[] = [];
  for (const project of projects) {
    const headings = [...(project.body ?? "").matchAll(/^## +(.+?)\s*$/gm)]
      .map((m) => m[1])
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
 * IA-005: dự án featured trước, sau đó theo `order`. Đây là chỗ duy nhất lấy
 * collection `projects`, để mọi trang dự án đều đi qua kiểm tra của IA-007.
 */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");
  assertDecisionSections(projects);
  return projects.sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.order - b.data.order);
}

/** IA-006: tối đa 3 dự án featured, theo `order`. */
export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured).slice(0, 3);
}

/** Tag có ít nhất một bài đã đăng, kèm số bài, nhiều bài trước (IA-002, IA-005). */
export async function getTagsWithCounts(): Promise<TagWithCount[]> {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getCollection("tags")]);
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const { id } of post.data.tags) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return tags
    .filter((tag) => counts.has(tag.id))
    .map((tag) => ({ tag, count: counts.get(tag.id)! }))
    .sort((a, b) => b.count - a.count || a.tag.data.label.vi.localeCompare(b.tag.data.label.vi, "vi"));
}

/**
 * Nút lọc chủ đề (IA-002, IA-004): tag `featured` có bài đã đăng, nhiều bài
 * trước như /tags/, vì nút kèm số bài. Tag featured chưa có bài thì chưa có
 * trang, nên không hiện.
 */
export async function getFeaturedTopics(): Promise<Tag[]> {
  return (await getTagsWithCounts()).filter(({ tag }) => tag.data.featured).map(({ tag }) => tag);
}

/** Nhãn hiển thị của các tag của một bài, theo thứ tự tác giả gắn. */
export async function getPostTags(post: Post): Promise<Tag[]> {
  const tags = await getCollection("tags");
  const byId = new Map(tags.map((tag) => [tag.id, tag]));
  return post.data.tags.map(({ id }) => byId.get(id)!);
}

/**
 * IA-008: getEntry() trả `undefined` khi thiếu file thay vì báo lỗi, nên trang
 * sẽ render thiếu chữ mà build vẫn qua.
 */
async function getPage<C extends "home" | "about">(collection: C, locale: string): Promise<CollectionEntry<C>> {
  const page = await getEntry(collection, locale);
  if (!page) throw new Error(`Thiếu src/content/pages/${locale}/${collection}.md.`);
  return page as CollectionEntry<C>;
}

/** Chữ của hero trang chủ và câu định vị (IA-008). */
export async function getHomePage(locale = "vi"): Promise<CollectionEntry<"home">> {
  const page = await getPage("home", locale);
  // Trang chủ chỉ đọc frontmatter; chữ ở thân bài sẽ mất mà không ai biết.
  if (page.body?.trim()) throw new Error(`${page.filePath}: thân bài không được hiển thị; đưa nội dung vào frontmatter.`);
  return page;
}

/** Nội dung trang Giới thiệu (IA-008). */
export async function getAboutPage(locale = "vi"): Promise<CollectionEntry<"about">> {
  const page = await getPage("about", locale);
  // Heading của các mục thuộc bố cục trong about.astro; heading trong thân bài
  // sẽ lệch cấp và lọt ra ngoài cấu trúc landmark của trang.
  const headings = [...(page.body ?? "").matchAll(/^#{1,6} +(.+?)\s*$/gm)].map((m) => m[1]);
  if (headings.length > 0) {
    throw new Error(`${page.filePath}: thân bài không dùng heading.\n  heading: ${JSON.stringify(headings)}`);
  }
  return page;
}

/** Nhóm theo năm đăng, năm mới nhất trước; giữ thứ tự bài bên trong. */
export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getUTCFullYear();
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups].sort(([a], [b]) => b - a).map(([year, posts]) => ({ year, posts }));
}

/**
 * IA-003: tối đa 3 bài, xếp theo số tag trùng rồi theo ngày mới hơn. Không
 * bài nào trùng tag thì trả về rỗng, không lấp bằng bài ngẫu nhiên.
 */
export async function getRelatedPosts(post: Post, limit = 3): Promise<{ post: Post; shared: string[] }[]> {
  const own = new Set(post.data.tags.map((t) => t.id));
  return (await getPublishedPosts())
    .filter((other) => other.id !== post.id)
    .map((other) => ({ post: other, shared: other.data.tags.map((t) => t.id).filter((id) => own.has(id)) }))
    .filter(({ shared }) => shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length || byNewest(a.post, b.post))
    .slice(0, limit);
}

/** IA-003: chiều ngược của `relatedProjects`, tính lúc build. */
export async function getPostsForProject(projectId: string): Promise<Post[]> {
  return (await getPublishedPosts()).filter((post) =>
    post.data.relatedProjects?.some(({ id }) => id === projectId),
  );
}

export type ProjectsOverview = {
  decisionCount: number;
  /** Quyết định có cả **Phương án đã cân nhắc.** và **Đánh đổi.** trong mục `##` của nó (IA-007). */
  weighedCount: number;
  /** Dự án có `repoUrl` / `liveUrl`: người đọc tự kiểm được. */
  withRepo: number;
  withLive: number;
  /** Bài có `relatedProjects` trỏ tới các dự án này, mới nhất trước. */
  posts: Post[];
  /** Mọi mục stack, dùng ở nhiều dự án trước, cùng số thì theo thứ tự xuất hiện. */
  stack: { name: string; count: number }[];
};

/**
 * Số liệu đầu trang /projects/, tính lúc build từ collection nên không lệch
 * với danh sách bên dưới (IA-005). Tag không có ở đây: tag thuộc bài viết
 * (IA-002), trang dự án chỉ đếm bài qua `relatedProjects` (IA-003).
 */
export async function getProjectsOverview(projects: Project[]): Promise<ProjectsOverview> {
  const ids = new Set(projects.map((p) => p.id));
  const posts = (await getPublishedPosts()).filter((post) =>
    post.data.relatedProjects?.some(({ id }) => ids.has(id)),
  );

  const stackCounts = new Map<string, number>();
  for (const p of projects) {
    for (const name of p.data.stack) stackCounts.set(name, (stackCounts.get(name) ?? 0) + 1);
  }
  // Map giữ thứ tự chèn và sort của JS ổn định, nên cùng số thì giữ thứ tự xuất hiện.
  const stack = [...stackCounts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return {
    decisionCount: projects.reduce((sum, p) => sum + p.data.decisions.length, 0),
    weighedCount: projects.reduce((sum, p) => sum + countWeighedDecisions(p), 0),
    withRepo: projects.filter((p) => p.data.repoUrl).length,
    withLive: projects.filter((p) => p.data.liveUrl).length,
    posts,
    stack,
  };
}

/**
 * IA-007: mỗi quyết định có bốn phần in đậm, nhưng build chỉ ép tên mục `##`,
 * không ép đủ bốn phần. Đếm quyết định có cả phần so sánh (**Phương án đã
 * cân nhắc.**) và phần đánh đổi (**Đánh đổi.**) để số trên /projects/ nói
 * thật: quyết định thiếu một trong hai thì tỉ lệ tụt, không bị che.
 */
function countWeighedDecisions(project: Project): number {
  const sections = new Map(
    (project.body ?? "").split(/^## +/m).slice(1).map((s) => {
      const [heading, ...rest] = s.split("\n");
      return [heading.trim(), rest.join("\n")] as const;
    }),
  );
  return project.data.decisions.filter(({ title }) => {
    const section = sections.get(title) ?? "";
    return /^\*\*Phương án đã cân nhắc\.\*\*/m.test(section) && /^\*\*Đánh đổi\.\*\*/m.test(section);
  }).length;
}

export type BlogOverview = {
  /** Số bài đã đăng của từng tag, để nút lọc chủ đề kèm số bài. */
  tagCounts: Map<string, number>;
  /** Tag có nhiều bài nhất; đồng hạng thì lấy hết. */
  topTags: Tag[];
  /** Bài có `relatedProjects`: viết từ dự án có case study để đối chiếu (IA-003). */
  projectPosts: Post[];
};

/**
 * Số liệu đầu trang /blog/, tính từ chính danh sách bài đã lọc draft nên
 * không lệch với danh sách bên dưới (IA-005).
 */
export async function getBlogOverview(posts: Post[]): Promise<BlogOverview> {
  const withCounts = await getTagsWithCounts();
  const tagCounts = new Map(withCounts.map(({ tag, count }) => [tag.id, count]));
  // getTagsWithCounts() đã xếp nhiều bài trước, nên phần tử đầu là mức cao nhất.
  const max = withCounts[0]?.count ?? 0;
  const topTags = withCounts.filter(({ count }) => count === max).map(({ tag }) => tag);
  const projectPosts = posts.filter((post) => (post.data.relatedProjects?.length ?? 0) > 0);
  return { tagCounts, topTags, projectPosts };
}

export async function getProjectsByIds(ids: string[]): Promise<Project[]> {
  const projects = await getCollection("projects");
  return ids.map((id) => projects.find((p) => p.id === id)!);
}

export const postUrl = (post: Post) => `/blog/${post.id}/`;
export const projectUrl = (project: Project) => `/projects/${project.id}/`;
export const tagUrl = (tag: Tag | string) => `/tags/${typeof tag === "string" ? tag : tag.id}/`;
