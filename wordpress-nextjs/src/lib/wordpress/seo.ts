import { Metadata } from 'next';
import { WPPost, WPPage } from '@/types/wordpress';

export function getMetadata(item: WPPost | WPPage, fallbackTitle?: string): Metadata {
  if (!item) {
    return { title: fallbackTitle || 'Not Found' };
  }

  const yoast = item.yoast_head_json;
  
  if (yoast) {
    return {
      title: yoast.title || item.title.rendered,
      description: yoast.og_description || yoast.description || item.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 160),
      openGraph: {
        title: yoast.og_title || yoast.title,
        description: yoast.og_description || yoast.description,
        images: yoast.og_image ? yoast.og_image.map((img: any) => ({
          url: img.url,
          width: img.width,
          height: img.height,
          alt: item.title.rendered
        })) : []
      }
    };
  }

  // Fallback to basic fields
  return {
    title: `${item.title.rendered} | Auto Buyers Guide`,
    description: item.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 160) || `Read more about ${item.title.rendered}`,
  };
}
