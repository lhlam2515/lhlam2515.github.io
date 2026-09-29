import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getHomePage, getPublishedPosts } from "../lib/content";
import { SITE } from "../lib/site";
import { postUrl } from "../lib/urls";

/** RSS của blog, bỏ bài draft (IA-001, IA-005). */
export const GET: APIRoute = async ({ site }) => {
  const [posts, home] = await Promise.all([getPublishedPosts(), getHomePage()]);
  return rss({
    title: `${SITE.name} — Blog`,
    description: home.data.description,
    site: site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
    })),
    customData: "<language>vi</language>",
  });
};
