"use client";

import { useCallback, useState } from "react";
import HeaderSearch from "./HeaderSearch";

export default function HeaderNavbar() {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = useCallback(() => {
    setNavOpen((open) => !open);
  }, []);

  const closeNav = useCallback(() => {
    setNavOpen(false);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container py-2">
        <a className="navbar-brand d-flex align-items-center gap-3" href="/">
          {/* <span className="cs-brand-badge d-inline-flex align-items-center justify-content-center text-white fw-bold">
            CSB
          </span>
          <span className="cs-brand-copy">
            <strong className="d-block text-dark">Car Sales Brisbane</strong>
            <small className="text-secondary d-block">
              A Statewide Auto Group Digital Showroom
            </small>
          </span> */}
          <img src="/assets/images/carsalesbrisbane_logo.webp" alt="Car Sales Brisbane" width={150} className="img-fluid rounded-3" />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNav}
          aria-expanded={navOpen}
          aria-controls="mainNav"
          aria-label="Open navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`collapse navbar-collapse${navOpen ? " show" : ""}`}
          id="mainNav"
        >
          <HeaderSearch />
          <ul className="navbar-nav ms-auto align-items-lg-center cs-main-nav">
            <li className="nav-item">
              <a className="nav-link text-dark" href="/" onClick={closeNav}>
                Home
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-dark"
                href="/search"
                onClick={closeNav}
              >
                Used Cars for sale
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-dark"
                href="/search?driveType=4WD&driveType=4x4"
                onClick={closeNav}
              >
                Used 4x4s For Sale
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-dark"
                href="/sell-my-car"
                onClick={closeNav}
              >
                Sell My Car
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-dark"
                href="/finance-centre"
                onClick={closeNav}
              >
                Finance Pre-Approval
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle text-dark"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                Company
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a
                    className="dropdown-item"
                    href="/about-us"
                    onClick={closeNav}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="/blog"
                    onClick={closeNav}
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="/contact"
                    onClick={closeNav}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="/terms-of-service"
                    onClick={closeNav}
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="/privacy-policy"
                    onClick={closeNav}
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
