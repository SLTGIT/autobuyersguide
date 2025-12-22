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
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 
          className="text-4xl font-bold mb-4 text-gray-800"
          dangerouslySetInnerHTML={{ __html: pageTitle }}
        />
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Building modern web experiences with Next.js and WordPress
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto">
        {pageContent ? (
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-blue-600 prose-strong:text-gray-800 prose-ul:text-gray-600 prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h2>
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

            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Technology Stack</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>Next.js 16:</strong> React framework with server-side rendering and static site generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>TypeScript:</strong> Type-safe development for better code quality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>Tailwind CSS:</strong> Utility-first CSS framework for rapid UI development</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>WordPress REST API:</strong> Headless CMS for content management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>React 19:</strong> Latest React features for modern UI development</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">WordPress Integration</h3>
                  <p className="text-gray-600 text-sm">
                    Full REST API integration for posts, pages, users, categories, tags, media, and menus
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Scalable Architecture</h3>
                  <p className="text-gray-600 text-sm">
                    Well-organized project structure with separation of concerns and reusable components
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Type Safety</h3>
                  <p className="text-gray-600 text-sm">
                    Comprehensive TypeScript types for all WordPress entities
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">SEO Optimized</h3>
                  <p className="text-gray-600 text-sm">
                    Built-in SEO support with Next.js metadata API and server-side rendering
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">💡 Tip</h3>
              <p className="text-gray-600 text-sm">
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
