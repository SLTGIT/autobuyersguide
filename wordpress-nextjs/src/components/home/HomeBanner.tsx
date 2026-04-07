import Image from "next/image";
import SearchForm from "./SearchForm";
import "./HomeBanner.scss";

export default function HomeBanner() {
  return (
    <section className="cs-hero py-5 text-white">
      <div className="container py-lg-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-7">
            <span className="badge cs-hero-chip cs-pill px-3 py-2 mb-3">
              Car Sales Brisbane
            </span>
            <h1 className="display-3 fw-bold mb-3 cs-title-tight">
              Quality Used Cars Brisbane | Expert Finance &amp; Sourcing
            </h1>
            <p className="lead mb-4">
              Access 60+ premium 4x4s, SUVs, and commercial vehicles. Based in
              Ormiston, we provide $0 deposit finance and statewide delivery
              from Brisbane to Cairns.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <a
                className="btn btn-light btn-lg cs-pill fw-semibold cs-cta-strong"
                href="/search"
              >
                Browse All Vehicles
              </a>
              <a
                className="btn btn-light btn-lg cs-pill cs-cta-strong text-primary"
                href="#finance-centre"
              >
                Check Finance Eligibility
              </a>
            </div>
          </div>
          <div className="col-lg-5">
            <article className="card border-0 shadow-lg rounded-5 overflow-hidden">
              <img
                src="/assets/images/banner-side-img.webp"
                className="card-img-top"
                alt="Used Cars Brisbane Statewide Auto Group featured vehicle"
              />
              <div className="card-body p-4">
                <span className="badge text-bg-primary cs-pill mb-3">
                  Statewide Auto Group
                </span>
                <h2 className="h4 fw-bold text-dark mb-2">
                  Brisbane based, finance ready, statewide delivery.
                </h2>
                <p className="text-secondary mb-0">
                  56 Freeth St W, Ormiston, QLD 4160
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
