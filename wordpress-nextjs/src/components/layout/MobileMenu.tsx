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
        className="d-md-none d-flex flex-column gap-1 border-0 bg-transparent p-0 focus-ring"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        style={{ width: '24px' }}
      >
        <span
          className={`d-block w-100 bg-dark transition-all`}
          style={{
            height: '2px',
            transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }}
        ></span>
        <span
          className={`d-block w-100 bg-dark transition-all ${isMenuOpen ? 'opacity-0' : ''}`}
          style={{ height: '2px' }}
        ></span>
        <span
          className={`d-block w-100 bg-dark transition-all`}
          style={{
            height: '2px',
            transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none'
          }}
        ></span>
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <ul className="d-md-none list-unstyled position-absolute start-0 end-0 bg-white shadow-lg py-3 px-3 m-0 d-flex flex-column gap-2" style={{ top: '100%', zIndex: 1050 }}>
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
                    className="d-block py-2 text-dark text-decoration-none hover-text-primary"
                    onClick={() => setIsMenuOpen(false)}
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                ) : (
                  <Link
                    href={href}
                    className="d-block py-2 text-dark text-decoration-none hover-text-primary"
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
