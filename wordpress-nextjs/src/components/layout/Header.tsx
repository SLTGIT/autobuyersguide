import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles['site-header']} id="header">
      <div className={`${styles['header-top']} border-lg-bottom`}>
        <div className="container-mid px-0 px-lg-3">
          <div className="d-flex justify-content-between align-items-center py-md-3 py-2 w-100">

            {/* Mobile Menu Toggle & Offcanvas */}
            <MobileMenu />

            {/* Logo */}
            <Link href="/" className={styles['navbar-brand']}>
              <Image
                src="/assets/images/logo.png"
                className="img-fluid"
                alt="Auto Buyers Guide Australia"
                title="Auto Buyers Guide - Your Trusted Car Buying Partner"
                width={165}
                height={45} // Approximate height based on width
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="main-navigation d-none d-lg-flex align-items-center flex-grow-1 justify-content-center">
              <ul className="nav-menu d-flex align-items-center mb-0 list-unstyled">

                {/* Used Cars Mega Menu */}
                <li className="nav-item has-megamenu">
                  <Link href="/used-cars" className="nav-link">
                    Used Cars
                  </Link>
                  <div className="megamenu">
                    <div className="container-mid">
                      <div className="row">
                        {/* Column 1: Budget Used Cars */}
                        <div className="col-lg-4">
                          <div className="megamenu-title">Budget Used Cars</div>
                          <ul className="megamenu-list">
                            <li><Link href="#">Used Cars Under $5,000</Link></li>
                            <li><Link href="#">Used Cars Under $10,000</Link></li>
                            <li><Link href="#">Used Cars Under $15,000</Link></li>
                            <li><Link href="#">Cheap Used Cars Australia</Link></li>
                          </ul>
                        </div>

                        {/* Column 2: Body Type */}
                        <div className="col-lg-4">
                          <div className="megamenu-title">Body Type</div>
                          <ul className="megamenu-list">
                            <li><Link href="#">Used SUVs for Sale</Link></li>
                            <li><Link href="#">Used Utes for Sale</Link></li>
                            <li><Link href="#">Used Hatchbacks</Link></li>
                            <li><Link href="#">Used Sedans</Link></li>
                            <li><Link href="#">Used Wagons</Link></li>
                            <li><Link href="#">Used 4WDs</Link></li>
                            <li><Link href="#">Used Vans</Link></li>
                          </ul>
                        </div>

                        {/* Column 3: Fuel Type */}
                        <div className="col-lg-4">
                          <div className="megamenu-title">Fuel Type</div>
                          <ul className="megamenu-list">
                            <li><Link href="#">Used Hybrid Cars</Link></li>
                            <li><Link href="#">Used Electric Cars</Link></li>
                            <li><Link href="#">Used Diesel Cars</Link></li>
                            <li><Link href="#">Used Petrol Cars</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                {/* New Cars Mega Menu */}
                <li className="nav-item has-megamenu">
                  <Link href="/new-cars" className="nav-link">
                    New Cars
                  </Link>
                  <div className="megamenu">
                    <div className="container-mid">
                      <div className="row">
                        {/* Column 1: New Car Types */}
                        <div className="col-lg-4">
                          <div className="megamenu-title">New Car Types</div>
                          <ul className="megamenu-list">
                            <li><Link href="#">Brand New Cars</Link></li>
                            <li><Link href="#">Demo Cars for Sale</Link></li>
                            <li><Link href="#">New Car Deals Australia</Link></li>
                          </ul>
                        </div>

                        {/* Column 2: Body Type */}
                        <div className="col-lg-4">
                          <div className="megamenu-title">Body Type</div>
                          <ul className="megamenu-list">
                            <li><Link href="#">New SUVs</Link></li>
                            <li><Link href="#">New Utes</Link></li>
                            <li><Link href="#">New Hatchbacks</Link></li>
                            <li><Link href="#">New Sedans</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Buying Guides Mega Menu */}
                <li className="nav-item has-megamenu">
                  <Link href="/buying-guides" className="nav-link">
                    Buying Guides
                  </Link>
                  <div className="megamenu">
                    <div className="container-mid">
                      <div className="row">
                        {/* Column 1: Research */}
                        <div className="col-lg-4">
                          <div className="megamenu-title">Research</div>
                          <ul className="megamenu-list">
                            <li><Link href="#">Best Cars to Buy in Australia</Link></li>
                            <li><Link href="#">Most Reliable Used Cars</Link></li>
                            <li><Link href="#">Cheapest Cars to Maintain</Link></li>
                          </ul>
                        </div>

                        {/* Column 2: Ownership */}
                        <div className="col-lg-4">
                          <div className="megamenu-title">Ownership</div>
                          <ul className="megamenu-list">
                            <li><Link href="#">Used Car Buying Checklist</Link></li>
                            <li><Link href="#">Dealer Test Drive Guide</Link></li>
                            <li><Link href="#">Understanding PPSR Checks</Link></li>
                            <li><Link href="#">Logbooks Explained</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                {/* Blogs Mega Menu */}
                <li className="nav-item">
                  <Link href="/blog" className="nav-link">
                    Blogs
                  </Link>
                </li>

              </ul>
            </nav>

            {/* Right Side Actions */}
            <div className={`${styles['header-actions']} d-flex align-items-center gap-3`}>
              {/* Search Icon Trigger */}
              <a href="#" className={`${styles['search-trigger']} d-none d-lg-flex`} aria-label="Search">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </a>

              {/* Shortlist Icon */}
              <Link href="/shortlist" className={`${styles['shortlist-icon']} d-none d-lg-flex`} aria-label="View Shortlist">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className={styles['shortlist-count']}>0</span>
              </Link>

              {/* Advertise CTA Button */}
              <Link href="/advertise" className={`${styles['btn-advertise']} d-none d-lg-inline-flex`}>
                Advertise with us
              </Link>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
