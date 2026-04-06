import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import "./Header.scss";
import HeaderSearch from "./HeaderSearch";

export default function Header() {
  return (
    <header className="sticky-top cs-header">
      <div className="cs-topbar py-0">
        <div className="container d-flex flex-wrap justify-content-center justify-content-lg-end align-items-center gap-3 gap-lg-4">
          <span className="d-inline-flex align-items-center gap-2">
            <span className="cs-rating-star">
              <i className="bi bi-star-fill"></i>
            </span>
            <span className="cs-rating-star">
              <i className="bi bi-star-fill"></i>
            </span>
            <span className="cs-rating-star">
              <i className="bi bi-star-fill"></i>
            </span>
            <span className="cs-rating-star">
              <i className="bi bi-star-fill"></i>
            </span>
            <span className="cs-rating-star">
              <i className="bi bi-star-half"></i>
            </span>
            <span>4.8 RATING OUT OF 240 REVIEWS</span>
          </span>
          <a
            className="d-inline-flex align-items-center gap-2"
            href="https://maps.google.com/?q=56+Freeth+St+W,+Ormiston,+QLD+4160"
          >
            <i className="bi bi-geo-alt-fill"></i>
            <span>56 Freeth St W, Ormiston</span>
          </a>
          <a
            className="d-inline-flex align-items-center gap-2"
            href="tel:0418908870"
          >
            <i className="bi bi-telephone-fill"></i>
            <span>0418908870</span>
          </a>
          <span className="d-inline-flex align-items-center gap-3">
            <a href="#" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#" aria-label="TikTok">
              <i className="bi bi-tiktok"></i>
            </a>
            <a href="#" aria-label="YouTube">
              <i className="bi bi-youtube"></i>
            </a>
          </span>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg">
        <div className="container py-2">
          <a className="navbar-brand d-flex align-items-center gap-3" href="/">
            <span className="cs-brand-badge d-inline-flex align-items-center justify-content-center text-white fw-bold">
              CSB
            </span>
            <span className="cs-brand-copy">
              <strong className="d-block text-dark">Car Sales Brisbane</strong>
              <small className="text-secondary d-block">
                A Statewide Auto Group Digital Showroom
              </small>
            </span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-label="Open navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <HeaderSearch />
            <ul className="navbar-nav ms-auto align-items-lg-center cs-main-nav">
              <li className="nav-item">
                <a className="nav-link text-dark" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-dark" href="/search">
                  Used Cars for sale
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-dark" href="/contact">
                  Sell My Car
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-dark" href="/finance-centre">
                  Finance Pre-Approval
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-dark" href="/contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
