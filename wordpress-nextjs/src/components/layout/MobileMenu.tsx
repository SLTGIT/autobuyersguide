'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import styles from './MobileMenu.module.scss';

export default function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSubmenu = (menu: string) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className={`${styles['navbar-toggler']} d-lg-none ${!isMenuOpen ? styles.collapsed : ''}`}
        type="button"
        aria-label="Toggle navigation"
        onClick={toggleMenu}
      >
        <span className={`${styles['icon-bar']} ${styles['top-bar']}`}></span>
        <span className={`${styles['icon-bar']} ${styles['middle-bar']}`}></span>
        <span className={`${styles['icon-bar']} ${styles['bottom-bar']}`}></span>
      </button>

      {/* Offcanvas Backdrop */}
      {isMenuOpen && (
        <div 
          className="offcanvas-backdrop fade show"
          onClick={toggleMenu}
          style={{ zIndex: 1040 }}
        ></div>
      )}

      {/* Offcanvas Menu */}
      <div 
        className={`offcanvas offcanvas-start ${isMenuOpen ? 'show' : ''}`} 
        tabIndex={-1} 
        style={{ visibility: isMenuOpen ? 'visible' : 'hidden', zIndex: 1045 }}
      >
        <div className="offcanvas-header align-items-center">
          <Link href="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
            Auto Buyers Guide
          </Link>
          <div className="d-flex align-items-center gap-2">
            <a href="#" className={styles['search-trigger-mobile']} aria-label="Search">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </a>
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={toggleMenu}
            ></button>
          </div>
        </div>
        
        <div className="offcanvas-body">
          <ul className={`${styles['mobile-nav-menu']} list-unstyled`}>
            <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>

            {/* Used Cars Accordion */}
            <li className={styles['has-submenu']}>
              <a 
                onClick={() => toggleSubmenu('usedCars')}
                className="d-flex justify-content-between align-items-center"
                aria-expanded={activeSubmenu === 'usedCars'}
              >
                Used Cars
              </a>
              <div className={`collapse ${styles.submenu} ${activeSubmenu === 'usedCars' ? 'show' : ''}`}>
                <div className={styles['submenu-section']}>
                  <div className={styles['submenu-section-title']}>Budget Used Cars</div>
                  <ul>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Under $5,000</Link></li>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Under $10,000</Link></li>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Under $15,000</Link></li>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Cheap Used Cars</Link></li>
                  </ul>
                </div>
                {/* More sections can be added here */}
              </div>
            </li>

            {/* New Cars Accordion */}
            <li className={styles['has-submenu']}>
              <a 
                onClick={() => toggleSubmenu('newCars')}
                className="d-flex justify-content-between align-items-center"
                aria-expanded={activeSubmenu === 'newCars'}
              >
                New Cars
              </a>
              <div className={`collapse ${styles.submenu} ${activeSubmenu === 'newCars' ? 'show' : ''}`}>
                <div className={styles['submenu-section']}>
                  <div className={styles['submenu-section-title']}>New Car Types</div>
                  <ul>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Brand New Cars</Link></li>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Demo Cars</Link></li>
                  </ul>
                </div>
              </div>
            </li>

             {/* Buying Guides Accordion */}
             <li className={styles['has-submenu']}>
              <a 
                onClick={() => toggleSubmenu('guides')}
                className="d-flex justify-content-between align-items-center"
                aria-expanded={activeSubmenu === 'guides'}
              >
                Buying Guides
              </a>
              <div className={`collapse ${styles.submenu} ${activeSubmenu === 'guides' ? 'show' : ''}`}>
                <div className={styles['submenu-section']}>
                  <div className={styles['submenu-section-title']}>Research</div>
                  <ul>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Best Cars to Buy</Link></li>
                    <li><Link href="#" onClick={() => setIsMenuOpen(false)}>Most Reliable Cars</Link></li>
                  </ul>
                </div>
              </div>
            </li>

            <li>
              <Link href="/advertise" className={styles['btn-advertise-mobile']} onClick={() => setIsMenuOpen(false)}>
                Advertise with us
              </Link>
            </li>
            
            <li>
              <Link href="/shortlist" onClick={() => setIsMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" className="me-2">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                My Shortlist (0)
              </Link>
            </li>
          </ul>

          {/* Social Icons */}
          <ul className="list-inline d-flex justify-content-center gap-4 mt-4 social-icons">
             <li className="list-inline-item">
                <a href="#" className="social-icon facebook" aria-label="Facebook">
                    <Image width={24} height={24} src="/assets/images/facebook.svg" alt="Facebook" />
                </a>
            </li>
            <li className="list-inline-item">
                <a href="#" className="social-icon instagram" aria-label="Instagram">
                    <Image width={24} height={24} src="/assets/images/instagram.svg" alt="Instagram" />
                </a>
            </li>
             <li className="list-inline-item">
                <a href="#" className="social-icon twitter" aria-label="Twitter">
                     <Image width={24} height={24} src="/assets/images/twitter.svg" alt="Twitter" />
                </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
