import Link from 'next/link';
import { getMenuByLocation, getSiteSettings, getNavigationPages } from '@/lib/wordpress';

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Fetch footer menu and site settings from WordPress
  let footerMenuItems: any[] = [];
  let siteTitle = 'WordPress Next.js';
  let siteDescription = 'A modern Next.js application powered by WordPress REST API. Built with TypeScript and Tailwind CSS for optimal performance.';

  try {
    const [footerMenu, settings] = await Promise.all([
      getMenuByLocation('footer_menu'),
      getSiteSettings()
    ]);

    if (settings?.title) {
      siteTitle = settings.title;
    }
    if (settings?.description) {
      siteDescription = settings.description;
    }

    // If footer menu exists, use it
    if (footerMenu && footerMenu.items && footerMenu.items.length > 0) {
      footerMenuItems = footerMenu.items;
    } else {
      // Fallback: Use pages as footer navigation
      const pages = await getNavigationPages();
      footerMenuItems = [
        { title: 'Home', url: '/', ID: 0 },
        ...pages.slice(0, 4).map(page => ({
          title: page.title.rendered,
          url: `/${page.slug}`,
          ID: page.id
        }))
      ];
    }
  } catch (error) {
    console.error('Error fetching footer data:', error);
    // Default fallback menu
    footerMenuItems = [
      { title: 'Home', url: '/', ID: 1 },
      { title: 'About', url: '/about', ID: 2 },
      { title: 'Blog', url: '/blog', ID: 3 },
      { title: 'Contact', url: '/contact', ID: 4 }
    ];
  }

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">{siteTitle}</h3>
            <p className="text-gray-300">
              {siteDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerMenuItems.map((item) => {
                const isExternal = item.url?.startsWith('http');
                const href = isExternal ? item.url : (item.url || '/');

                return (
                  <li key={item.ID}>
                    {isExternal ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors"
                        dangerouslySetInnerHTML={{ __html: item.title }}
                      />
                    ) : (
                      <Link 
                        href={href} 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        <span dangerouslySetInnerHTML={{ __html: item.title }} />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@example.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Main St, City, Country</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {currentYear} {siteTitle}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
