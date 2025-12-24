import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.scss';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles['site-footer']}>
      <div className={styles['arc__upper']}></div>
      
      <div className={styles['pre-footer']}>
        <div className="container-mid">
          <div className="row">
            {/* Support Column */}
            <div className="col-md-6 col-lg-3">
              <div className={styles['footer-menu-container']}>
                <div className={styles['footer-menu-title']}>
                  Support
                </div>
                <div className={styles['footer-menu-contact']}>
                  <div className={styles['footer-menu-contact-title']}>Mail</div>
                  <a href="mailto:hello@autobuyersguide.com.au">hello@autobuyersguide.com.au</a>
                </div>
                <div className={styles['footer-menu-contact']}>
                  <div className={styles['footer-menu-contact-title']}>Phone</div>
                  <a href="tel:+61432515483">+61 432 515 483</a>
                </div>
                <div className={styles['footer-menu-contact']}>
                  <div className={styles['footer-menu-contact-title']}>Address</div>
                  <a href="#">Brisbane, QLD, Australia, Queensland</a>
                </div>
              </div>
            </div>

            {/* Dealer Column */}
            <div className="col-md-6 col-lg-3">
              <div className={styles['footer-menu-container']}>
                <div className={styles['footer-menu-title']}>
                  Dealer
                </div>
                <ul>
                  <li><Link href="#">Dealer Login</Link></li>
                  <li><Link href="#">Dealer Help Centre</Link></li>
                </ul>
              </div>
            </div>

            {/* Company Column */}
            <div className="col-md-6 col-lg-3">
              <div className={styles['footer-menu-container']}>
                <div className={styles['footer-menu-title']}>
                  Company
                </div>
                <ul className="list-unstyled">
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><Link href="#">Locations</Link></li>
                </ul>
              </div>
            </div>

            {/* Contact Us / Social Column */}
            <div className="col-md-6 col-lg-3">
              <div className={styles['footer-menu-container']}>
                <div className={styles['footer-menu-title']}>
                  Contact Us
                </div>
                <ul>
                  <li><Link href="/advertise">Advertise With Us</Link></li>
                  <li><Link href="/vehicles">Vehicles</Link></li>
                </ul>
                <ul className="list-inline d-flex justify-content-start gap-2 mt-4 social-icons">
                  <li className="list-inline-item me-3">
                    <a href="#" className="social-icon facebook" aria-label="Facebook">
                      <div className="icon-box">
                        <Image width={24} height={24} src="/assets/images/facebook.svg" alt="Facebook" />
                      </div>
                    </a>
                  </li>
                  <li className="list-inline-item me-3">
                     <a href="#" className="social-icon twitter" aria-label="Twitter">
                      <div className="icon-box">
                        <Image width={24} height={24} src="/assets/images/twitter.svg" alt="Twitter" />
                      </div>
                    </a>
                  </li>
                  <li className="list-inline-item me-3">
                    <a href="#" className="social-icon instagram" aria-label="Instagram">
                      <div className="icon-box">
                         <Image width={24} height={24} src="/assets/images/instagram.svg" alt="Instagram" />
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['copyright-text']}>
        <div className="container-mid">
          <div className={styles['copyright-text-container']}>
            <div className={styles['footer-logo']}>
               {/* Update path to match copied assets */}
              <Image 
                src="/assets/images/my-logos/ab-logo.webp" 
                className="img-fluid" 
                alt="Auto Buyers" 
                title="Auto Buyers"
                width={130} 
                height={100}
              />
            </div>

            <div className={styles['copyright-text-content']}>
              <p>
                <Link href="/">Auto Buyers Guide.</Link> Copyright © {currentYear}. All Rights Reserved | 
                <Link href="#"> Sitemap</Link> | 
                <Link href="#"> Terms of Use</Link> | 
                <Link href="#"> Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
