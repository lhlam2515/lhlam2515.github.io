import { getCollection, getEntry, type CollectionEntry } from "astro:content";
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

/** Dự án theo thứ tự `ids`, qua getProjects() để cũng chịu kiểm tra của IA-007. */
export async function getProjectsByIds(ids: string[]): Promise<Project[]> {
  const projects = await getProjects();
  return ids.map((id) => {
    const project = projects.find((p) => p.id === id);
    if (!project) throw new Error(`Không có dự án "${id}".`);
    return project;
  });
}
