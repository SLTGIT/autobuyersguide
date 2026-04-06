import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-5 text-white" style={{ background: "#122033" }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h3 className="h5 fw-bold">Our Identity</h3>
            <p className="text-white-50 mb-1">
              Car Sales Brisbane is an online sales channel of Statewide Auto
              Group. We specialize in vehicle sourcing, onsite finance, and
              Queensland-wide delivery.
            </p>
            <p className="text-white-50 mb-0">QLD Dealer License: 4316086</p>
          </div>
          <div className="col-lg-4">
            <h3 className="h5 fw-bold">Service Areas</h3>
            <p className="text-white-50 mb-0">
              Greater Brisbane, Ormiston, Capalaba, Gold Coast, Sunshine Coast,
              Townsville, Cairns, Mackay, Rockhampton, Mt Isa.
            </p>
          </div>
          <div className="col-lg-4">
            <h3 className="h5 fw-bold">Site Links</h3>
            <p className="text-white-50 mb-0">
              <Link href="/privacy-policy">Privacy Policy</Link> |{" "}
              <Link href="/terms-of-service">Terms of Service</Link> |{" "}
              <Link href="/finance-disclaimer">Finance Disclaimer</Link> 
              {/* |{" "}
              <Link href="/sitemap">Sitemap</Link> */}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
