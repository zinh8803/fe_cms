export interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  robots?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const SITE_NAME = 'TechBlog';
const DEFAULT_DESCRIPTION =
  'TechBlog - Chia sẻ kiến thức lập trình VueJS, Yii2 và phát triển web hiện đại.';
// Use a proper 1200x630 OG image — favicon.png is too small for social sharing
const DEFAULT_IMAGE = '/og-image.png';

const getSiteUrl = () => {
  return import.meta.env.VITE_SITE_URL || window.location.origin;
};

export const absoluteUrl = (url?: string | null) => {
  if (!url) return new URL(DEFAULT_IMAGE, getSiteUrl()).toString();
  return new URL(url, getSiteUrl()).toString();
};

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content?: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setCanonical = (url: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

export const applySeo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image,
  url,
  type = 'website',
  robots = 'index, follow',
  publishedTime,
  modifiedTime,
  author,
}: SeoOptions) => {
  let canonicalUrl = url || new URL(window.location.pathname, getSiteUrl()).toString();
  if (url) {
    try {
      const parsed = new URL(url);
      parsed.search = '';
      parsed.hash = '';
      canonicalUrl = parsed.toString();
    } catch (e) {
      // Fallback
    }
  }
  const imageUrl = absoluteUrl(image);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} - ${SITE_NAME}`;

  document.title = fullTitle;

  // Language attribute stays vi for the app shell
  document.documentElement.setAttribute('lang', 'vi');

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="robots"]', 'name', 'robots', robots);
  setMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  setMeta('meta[property="og:type"]', 'property', 'og:type', type);
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
  setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
  // Article-specific Open Graph tags
  if (type === 'article') {
    setMeta('meta[property="article:published_time"]', 'property', 'article:published_time', publishedTime);
    setMeta('meta[property="article:modified_time"]', 'property', 'article:modified_time', modifiedTime);
    setMeta('meta[property="article:author"]', 'property', 'article:author', author);
  }
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
  setCanonical(canonicalUrl);
};

/**
 * Inject a JSON-LD BlogPosting structured data script into <head>.
 * Removes any previous article schema before inserting the new one.
 */
export const injectArticleJsonLd = (data: {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedTime: string;
  modifiedTime: string;
  author: string;
}) => {
  // Remove old article LD
  document.head.querySelector('#article-ld')?.remove();

  const script = document.createElement('script');
  script.id = 'article-ld';
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    image: data.image,
    url: data.url,
    datePublished: data.publishedTime,
    dateModified: data.modifiedTime,
    author: {
      '@type': 'Person',
      name: data.author || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/og-image.png'),
      },
    },
  });
  document.head.appendChild(script);
};

export const defaultSeo = {
  siteName: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  image: DEFAULT_IMAGE,
};
