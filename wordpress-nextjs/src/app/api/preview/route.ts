import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Preview API Route
 * Handles preview requests from WordPress admin
 * 
 * Query Parameters:
 * - secret: Preview secret for authentication
 * - type: Content type (post, page, vehicle)
 * - slug: Content slug
 * - id: Content ID (optional)
 * - status: Post status (optional)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get query parameters
  const secret = searchParams.get('secret');
  const type = searchParams.get('type');
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  
  // Validate preview secret
  const previewSecret = process.env.WORDPRESS_PREVIEW_SECRET;
  
  if (!previewSecret) {
    return NextResponse.json(
      { 
        error: 'Preview secret not configured',
        message: 'Please add WORDPRESS_PREVIEW_SECRET to your .env file'
      },
      { status: 500 }
    );
  }
  
  if (!secret || secret !== previewSecret) {
    return NextResponse.json(
      { 
        error: 'Invalid preview secret',
        message: 'The preview secret provided does not match'
      },
      { status: 401 }
    );
  }
  
  // Validate required parameters
  if (!type || !slug) {
    return NextResponse.json(
      { 
        error: 'Missing required parameters',
        message: 'Both "type" and "slug" parameters are required'
      },
      { status: 400 }
    );
  }
  
  /** WordPress pages that map to first-party Next routes (no generic /[slug] CMS renderer). */
  const pagePreviewPath = new Map<string, string>([
    ['home', '/'],
    ['front-page', '/'],
    ['about-us', '/about-us'],
    ['blog', '/blog'],
    ['contact', '/contact'],
    ['finance-centre', '/finance-centre'],
    ['finance-disclaimer', '/finance-disclaimer'],
    ['privacy-policy', '/privacy-policy'],
    ['sell-my-car', '/sell-my-car'],
    ['search', '/search'],
    ['terms-of-service', '/terms-of-service'],
  ]);

  // Build the preview URL based on content type
  let previewUrl: string;
  
  switch (type) {
    case 'post':
      previewUrl = `/blog/${slug}`;
      break;
      
    case 'page': {
      const path = pagePreviewPath.get(slug);
      if (!path) {
        return NextResponse.json(
          {
            error: 'No preview route',
            message: `WordPress page slug "${slug}" is not mapped to a Next.js page.`,
          },
          { status: 404 },
        );
      }
      previewUrl = path;
      break;
    }
      
    case 'vehicle':
      previewUrl = `/vehicles/${slug}`;
      break;
      
    default:
      // For other custom post types, use the type as the base path
      previewUrl = `/${type}/${slug}`;
  }
  
  // Add preview query parameter
  previewUrl += '?preview=true';
  
  // If ID is provided, add it to the URL for additional context
  if (id) {
    previewUrl += `&id=${id}`;
  }
  
  // Enable draft mode
  (await draftMode()).enable();
  
  // Log preview request (optional, for debugging)
  console.log(`[Preview] Enabling draft mode for ${type}: ${slug}`);
  
  // Redirect to the preview URL
  redirect(previewUrl);
}

/**
 * Disable preview/draft mode
 * Access this endpoint to exit preview mode
 */
export async function DELETE() {
  (await draftMode()).disable();
  
  return NextResponse.json(
    { 
      message: 'Draft mode disabled',
      success: true
    },
    { status: 200 }
  );
}
