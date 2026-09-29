import { countWeighedDecisions } from "./case-study";
import { getPublishedPosts, getTagsWithCounts, type Post, type Project, type Tag } from "./content";
import { formatDate } from "./format";
import { SITE } from "./site";

/*
 * Số liệu đầu trang /projects/ và /blog/ (StatIntro), tính lúc build từ chính
 * danh sách bên dưới nên không lệch với nó (IA-005). Câu dẫn của mỗi thẻ là
 * một sự thật tính từ nội dung, không phải khẩu hiệu.
 */

/** Một thẻ số liệu; thẻ có `value` 0 không hiện. */
export type Stat = { label: string; lead: string; value: number };

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
  stats: Stat[];
};

/**
 * Số liệu đầu trang /projects/. Tag không có ở đây: tag thuộc bài viết
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

  const n = projects.length;
  const decisionCount = projects.reduce((sum, p) => sum + p.data.decisions.length, 0);
  const weighedCount = projects.reduce((sum, p) => sum + countWeighedDecisions(p), 0);
  const withRepo = projects.filter((p) => p.data.repoUrl).length;
  const withLive = projects.filter((p) => p.data.liveUrl).length;

  // Người đọc biết kiểm chứng được tới đâu (mã nguồn, bản chạy), mỗi quyết
  // định có so sánh và đánh đổi không, và dự án còn được viết tiếp không. Đủ
  // cả thì nói gọn, thiếu thì hiện tỉ lệ để chỗ thiếu không bị che.
  const openLead =
    withRepo === n && withLive === n
      ? "Đều mở mã nguồn và có bản đang chạy"
      : `${withRepo}/${n} mở mã nguồn, ${withLive}/${n} có bản đang chạy`;
  const weighedLead =
    weighedCount === decisionCount
      ? "Đi kèm so sánh phương án và đánh đổi"
      : `${weighedCount}/${decisionCount} kèm so sánh và đánh đổi`;
  const latestPost = posts[0];
  const stats = [
    { label: "Dự án", lead: openLead, value: n },
    { label: "Quyết định", lead: weighedLead, value: decisionCount },
    {
      label: "Bài viết",
      lead: latestPost ? `Viết về các dự án này, mới nhất ngày ${formatDate(latestPost.data.pubDate)}` : "",
      value: posts.length,
    },
  ];

  return { decisionCount, weighedCount, withRepo, withLive, posts, stack, stats };
}

export type BlogOverview = {
  /** Số bài đã đăng của từng tag, để nút lọc chủ đề kèm số bài. */
  tagCounts: Map<string, number>;
  /** Tag có nhiều bài nhất; đồng hạng thì lấy hết. */
  topTags: Tag[];
  /** Bài có `relatedProjects`: viết từ dự án có case study để đối chiếu (IA-003). */
  projectPosts: Post[];
  stats: Stat[];
};

/**
 * Số liệu đầu trang /blog/, từ danh sách bài đã lọc draft. Người đọc biết blog
 * còn viết không, viết về gì, và bài nào có dự án để đối chiếu.
 */
export async function getBlogOverview(posts: Post[]): Promise<BlogOverview> {
  const withCounts = await getTagsWithCounts();
  const tagCounts = new Map(withCounts.map(({ tag, count }) => [tag.id, count]));
  // getTagsWithCounts() đã xếp nhiều bài trước, nên phần tử đầu là mức cao nhất.
  const max = withCounts[0]?.count ?? 0;
  const topTags = withCounts.filter(({ count }) => count === max).map(({ tag }) => tag);
  const projectPosts = posts.filter((post) => (post.data.relatedProjects?.length ?? 0) > 0);

  const latest = posts[0];
  const topLabels = new Intl.ListFormat(SITE.locale, { type: "conjunction" }).format(
    topTags.map((tag) => tag.data.label.vi),
  );
  const stats = [
    { label: "Bài viết", lead: latest ? `Mới nhất ngày ${formatDate(latest.data.pubDate)}` : "", value: posts.length },
    { label: "Chủ đề", lead: `Viết nhiều nhất về ${topLabels}`, value: tagCounts.size },
    { label: "Từ dự án", lead: "Có case study đi kèm để đối chiếu", value: projectPosts.length },
  ];

  return { tagCounts, topTags, projectPosts, stats };
}
