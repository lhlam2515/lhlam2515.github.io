import type { Post, Project, Tag } from "./content";

// IA-001: URL nội bộ luôn có `/` cuối; checkLinks() làm build thất bại với link thiếu.
export const postUrl = (post: Post) => `/blog/${post.id}/`;
export const projectUrl = (project: Project) => `/projects/${project.id}/`;
export const tagUrl = (tag: Tag | string) => `/tags/${typeof tag === "string" ? tag : tag.id}/`;
