import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { countWeighedDecisions } from "./case-study";
import { assertAboutBody, assertDecisionSections, assertHomeBody, assertReferences } from "./checks";

export type Post = CollectionEntry<"blog">;
export type Project = CollectionEntry<"projects">;
export type Tag = CollectionEntry<"tags">;
export type TagWithCount = { tag: Tag; count: number };

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
  assertHomeBody(page);
  return page;
}

/** Nội dung trang Giới thiệu (IA-008). */
export async function getAboutPage(locale = "vi"): Promise<CollectionEntry<"about">> {
  const page = await getPage("about", locale);
  assertAboutBody(page);
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

/** Id anchor của nhóm năm/tháng trong danh sách bài; mục lục của /blog/ trỏ tới đây. */
export function archiveId(year: number, month?: number): string {
  return month ? `y${year}-m${String(month).padStart(2, "0")}` : `y${year}`;
}

/** Nhóm theo tháng đăng (1–12, UTC như `formatDate()`); bài đã xếp mới nhất trước thì tháng cũng vậy. */
export function groupByMonth(posts: Post[]): { month: number; posts: Post[] }[] {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const month = post.data.pubDate.getUTCMonth() + 1;
    groups.set(month, [...(groups.get(month) ?? []), post]);
  }
  return [...groups].map(([month, posts]) => ({ month, posts }));
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

/** Dự án theo thứ tự `ids`, qua getProjects() để cũng chịu kiểm tra của IA-007. */
export async function getProjectsByIds(ids: string[]): Promise<Project[]> {
  const projects = await getProjects();
  return ids.map((id) => {
    const project = projects.find((p) => p.id === id);
    if (!project) throw new Error(`Không có dự án "${id}".`);
    return project;
  });
}
