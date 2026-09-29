import type { Post, Tag } from "./content";
import { isoDate } from "./format";
import { CONTACT, SITE } from "./site";
import { postUrl } from "./urls";

/*
 * JSON-LD theo loại trang (content-system.md, Metadata theo loại trang). Base.astro
 * nhận kết quả qua prop `jsonLd`. `site` là Astro.site: URL tuyệt đối dựng từ
 * SITE_URL, không viết cứng domain.
 */

type JsonLd = Record<string, unknown>;

/** Trang chủ. */
export function websiteJsonLd(site: URL | undefined, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: new URL("/", site).href,
    inLanguage: "vi",
    description,
    author: { "@type": "Person", name: SITE.author },
  };
}

/** Trang Giới thiệu. */
export function personJsonLd(site: URL | undefined): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author,
    alternateName: SITE.name,
    jobTitle: SITE.jobTitle,
    url: new URL("/about/", site).href,
    address: { "@type": "PostalAddress", addressLocality: "Thành phố Hồ Chí Minh", addressCountry: "VN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: SITE.school },
    sameAs: [CONTACT.github.url, CONTACT.linkedin.url],
  };
}

/** Trang bài; `tags` theo thứ tự tác giả gắn, như getPostTags(). */
export function blogPostingJsonLd(post: Post, tags: Tag[], site: URL | undefined): JsonLd {
  const { data } = post;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.description,
    datePublished: isoDate(data.pubDate),
    dateModified: isoDate(data.updatedDate ?? data.pubDate),
    inLanguage: "vi",
    url: new URL(postUrl(post), site).href,
    author: { "@type": "Person", name: SITE.author, url: new URL("/about/", site).href },
    keywords: tags.map((tag) => tag.data.label.vi).join(", "),
  };
}
