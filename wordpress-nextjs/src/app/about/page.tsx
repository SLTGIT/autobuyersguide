import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'About Us | WordPress Next.js',
  description: 'Learn more about our WordPress Next.js application',
};

export default async function About() {
  // Fetch the About page from WordPress
  let pageContent = null;
  let pageTitle = 'About Us';

  try {
    const page = await getPageBySlug('about');
    if (page) {
      pageContent = page.content.rendered;
      pageTitle = page.title.rendered;
    }
  } catch (error) {
    console.error('Error fetching About page:', error);
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 
          className="text-4xl font-bold text-gray-800 mb-4"
          dangerouslySetInnerHTML={{ __html: pageTitle }}
        />
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Building modern web experiences with Next.js and WordPress
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-8">
        {pageContent ? (
          <div 
            className="prose prose-lg max-w-none prose-blue"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        ) : (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We are dedicated to creating fast, scalable, and user-friendly web applications
                that leverage the power of modern technologies. By combining Next.js with
                WordPress REST API, we deliver the best of both worlds: a flexible content
                management system with cutting-edge frontend performance.
              </p>
              <p className="text-gray-600">
                Our platform is built with TypeScript for type safety, Tailwind CSS for beautiful
                responsive designs, and follows industry best practices for code organization
                and scalability.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Technology Stack</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>Next.js 14:</strong> React framework with server-side rendering and static site generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>TypeScript:</strong> Type-safe development for better code quality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>Tailwind CSS:</strong> Utility-first CSS framework for rapid UI development</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>WordPress REST API:</strong> Headless CMS for content management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-700"><strong>React 18:</strong> Latest React features for modern UI development</span>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h3 className="font-bold text-gray-800 mb-2">WordPress Integration</h3>
                  <p className="text-sm text-gray-600">
                    Full REST API integration for posts, pages, users, categories, tags, media, and menus
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h3 className="font-bold text-gray-800 mb-2">Scalable Architecture</h3>
                  <p className="text-sm text-gray-600">
                    Well-organized project structure with separation of concerns and reusable components
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h3 className="font-bold text-gray-800 mb-2">Type Safety</h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive TypeScript types for all WordPress entities
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h3 className="font-bold text-gray-800 mb-2">SEO Optimized</h3>
                  <p className="text-sm text-gray-600">
                    Built-in SEO support with Next.js metadata API and server-side rendering
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              <h3 className="font-bold mb-2">💡 Tip</h3>
              <p className="text-sm">
                To customize this page, create a page with slug "about" in your WordPress admin panel.
                The content will automatically appear here!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
