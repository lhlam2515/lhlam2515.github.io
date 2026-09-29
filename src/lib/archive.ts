import type { Post } from "./content";
import type { TocPart } from "./toc";

/*
 * Nhóm bài theo năm/tháng cho danh sách bài (PostYearList) và mục lục của
 * /blog/ (IA-005). Hai bên khớp nhau qua archiveId().
 */

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
 * Mục lục năm → tháng kèm số bài của /blog/. Chỉ năm mới nhất mở sẵn, để mục
 * lục không dài theo số tháng đã viết.
 */
export function archiveToc(posts: Post[]): TocPart[] {
  return groupByYear(posts).map(({ year, posts }, i) => ({
    id: archiveId(year),
    text: String(year),
    count: posts.length,
    open: i === 0,
    items: groupByMonth(posts).map(({ month, posts }) => ({
      id: archiveId(year, month),
      text: `Tháng ${month}`,
      count: posts.length,
    })),
  }));
}

/**
 * Id các tháng mở sẵn trong danh sách bài: tháng mới nhất luôn mở; các tháng
 * sau mở tiếp chừng nào tổng số bài đang mở chưa vượt `openLimit`. Duyệt từ
 * mới đến cũ, qua cả ranh giới năm, và dừng ở tháng đầu tiên làm vượt giới
 * hạn, để phần mở luôn là một khối liền từ bài mới nhất.
 */
export function openMonthIds(posts: Post[], openLimit: number): Set<string> {
  const months = groupByYear(posts).flatMap(({ year, posts }) =>
    groupByMonth(posts).map(({ month, posts }) => ({ year, month, count: posts.length })),
  );
  const open = new Set<string>();
  let shown = 0;
  for (const { year, month, count } of months) {
    if (shown > 0 && shown + count > openLimit) break;
    open.add(archiveId(year, month));
    shown += count;
  }
  return open;
}
