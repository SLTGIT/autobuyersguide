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
    <footer className="footer">
      <div className="footer__content">
        {/* About Section */}
        <div className="footer__section">
          <h3>{siteTitle}</h3>
          <p>{siteDescription}</p>
        </div>

        {/* Quick Links */}
        <div className="footer__section">
          <h3>Quick Links</h3>
          <ul className="footer__list">
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
                      className="transition-colors"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                  ) : (
                    <Link 
                      href={href} 
                      className="transition-colors"
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
        <div className="footer__section">
          <h3>Contact</h3>
          <ul className="footer__contact">
            <li>Email: info@example.com</li>
            <li>Phone: +1 234 567 890</li>
            <li>Address: 123 Main St, City, Country</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <p>&copy; {currentYear} {siteTitle}. All rights reserved.</p>
      </div>
    </footer>
  );
}
