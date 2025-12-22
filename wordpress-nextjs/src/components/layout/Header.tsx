import Link from 'next/link';
import { getMenuByName, getNavigationPages, getSiteSettings } from '@/lib/wordpress';
import MobileMenu from './MobileMenu';


export default async function Header() {
  // Fetch menu and site settings from WordPress
  let menuItems: any[] = [];
  let siteTitle = 'WordPress Next.js';
  let settings: { title: string; description: string; url: string } | null = null;

  try {
    const [menu, fetchedSettings] = await Promise.all([
      getMenuByName('main-menu'),
      getSiteSettings()
    ]);
    
    settings = fetchedSettings;

    if (settings?.title) {
      siteTitle = settings.title;
    }

    // If menu exists, use it
    if (menu && menu.items && menu.items.length > 0) {
      menuItems = menu.items;
    } else {
      // Fallback: Use pages as navigation
      const pages = await getNavigationPages();
      menuItems = [
        { title: 'Home', url: '/', ID: 0 },
        ...pages.map(page => ({
          title: page.title.rendered,
          url: `/${page.slug}`,
          ID: page.id
        })),
        { title: 'Blog', url: '/blog', ID: 9999 }
      ];
    }
  } catch (error) {
    console.error('Error fetching header data:', error);
    // Customize fallback menu
    menuItems = [
      { title: 'Home', url: '/', ID: 1 },
      { title: 'About', url: '/about', ID: 2 },
      { title: 'Blog', url: '/blog', ID: 3 },
      { title: 'Contact', url: '/contact', ID: 4 }
    ];
  }

  // Normalize URLs centrally
  const cmsUrl = settings?.url || process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.split('/wp-json')[0] || '';
  
  const normalizedMenuItems = menuItems.map(item => {
    let href = item.url || '/';
    
    // Only normalize internal links that start with the CMS URL
    if (cmsUrl && href.startsWith(cmsUrl)) {
      href = href.replace(cmsUrl, '');
      if (!href.startsWith('/')) href = '/' + href;
    }
    
    return {
      ...item,
      url: href
    };
  });

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600">
            {siteTitle}
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8">
            {normalizedMenuItems.map((item) => {
              const isExternal = item.url.startsWith('http');
              const href = item.url;
              
              return (
                <li key={item.ID}>
                  {isExternal ? (
                    <a 
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                  ) : (
                    <Link 
                      href={href} 
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <span dangerouslySetInnerHTML={{ __html: item.title }} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu */}
          <MobileMenu menuItems={normalizedMenuItems} />
        </div>
      </nav>
    </header>
  );
}
