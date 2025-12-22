'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MenuItem {
  ID: number;
  title: string;
  url: string;
}

interface MobileMenuProps {
  menuItems: MenuItem[];
}

export default function MobileMenu({ menuItems }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex flex-col space-y-1.5 focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <ul className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50 py-4 px-4 space-y-2">
          {menuItems.map((item) => {
            const isExternal = item.url?.startsWith('http');
            const href = item.url || '/';

            return (
              <li key={item.ID}>
                {isExternal ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                ) : (
                  <Link
                    href={href}
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span dangerouslySetInnerHTML={{ __html: item.title }} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
