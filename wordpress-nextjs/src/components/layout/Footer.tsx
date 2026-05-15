import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className=" text-white" style={{ background: "#122033" }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <h3 className="h5 fw-bold">Our Identity</h3>
            <p className="text-white-50 mb-1">
              Car Sales Brisbane is an online sales channel. We specialize in
              vehicle sourcing, onsite finance, and Queensland-wide delivery.
            </p>
            <p className="text-white-50 mb-0">QLD Dealer License: 4065904</p>
            <p className={`${styles.poweredBy} text-white-50 mb-0 mt-3`}>
              Powered and maintained by{" "}
              <span className={styles.provider}>Dealer Sales LLC</span>
            </p>
          </div>
          <div className="col-lg-1"></div>
          <div className="col-lg-3">
            <h3 className="h5 fw-bold">Used Cars</h3>
            <ul className="list-unstyled text-white-50 mb-0">
              <li>
                <Link href={"/search/4x4"}>4x4 Cars for Sale</Link>
              </li>
              <li>
                <Link href={"/search/sedan"}>Sedan Cars</Link>
              </li>
              <li>
                <Link href={"/search/suv"}>SUV Cars</Link>
              </li>
              <li>
                <Link href={"/search/hatchback"}>Hatchback Cars</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h3 className="h5 fw-bold">Company</h3>
            <ul className="list-unstyled text-white-50 mb-0">
              <li>
                <Link href="/about-us">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-of-service">Terms of Service</Link>
              </li>
              <li>
                <Link href="/finance-disclaimer">Finance Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="copyright-text">
        <div className="copyright-text-container">
          <div className="copyright-text-content text-center">
            <p className=" mb-1 text-white-50 fs-6 fw-normal">
              Car Sales Brisbane - Car Dealership in Australia - Copyright
              &copy; {currentYear} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
