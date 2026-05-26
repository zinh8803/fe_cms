export interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  robots?: string;
}

const SITE_NAME = 'TechBlog';
const DEFAULT_DESCRIPTION =
  'TechBlog chia se kien thuc lap trinh VueJS, Yii2 va phat trien web hien dai.';
const DEFAULT_IMAGE = '/favicon.png';

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
}: SeoOptions) => {
  const canonicalUrl = url || new URL(window.location.pathname, getSiteUrl()).toString();
  const imageUrl = absoluteUrl(image);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} - ${SITE_NAME}`;

  document.title = fullTitle;

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="robots"]', 'name', 'robots', robots);
  setMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  setMeta('meta[property="og:type"]', 'property', 'og:type', type);
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
  setCanonical(canonicalUrl);
};

export const defaultSeo = {
  siteName: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  image: DEFAULT_IMAGE,
};
