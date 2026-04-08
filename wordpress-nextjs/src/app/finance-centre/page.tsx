import { Metadata } from "next";
import { getSiteSettings } from "@/lib/wordpress";
import "./finance-centre.css";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    // title: siteSettings?.title || 'Home | Statewide Auto Group',
    title: "Finance Centre | Car Sales Brisbane",
    description: "Finance Centre | Car Sales Brisbane",
  };
}

export default function FinanceCentre() {
  return (
    <>
      <section className="cs-page-hero py-5 text-white">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <span className="badge cs-hero-chip cs-pill px-3 py-2 mb-3">
                Finance Pre-Approval
              </span>
              <h1 className="display-5 fw-bold mb-3 cs-title-tight">
                Check Finance Eligibility
              </h1>
              <p className="lead mb-0">
                Finance-first support for Brisbane buyers, ABN holders, and
                low-doc applicants.
              </p>
            </div>
            <div className="col-lg-5">
              <article className="card border-0 shadow-lg rounded-5">
                <div className="card-body p-4 p-lg-5">
                  <div className="d-grid gap-3">
                    <a
                      className="btn text-white cs-pill"
                      style={{ background: "var(--cs-primary)" }}
                      href="mailto:sales@statewideautogroup.com.au"
                    >
                      Check Finance Eligibility
                    </a>
                    <a
                      className="btn btn-outline-primary cs-pill"
                      href="mailto:sales@statewideautogroup.com.au"
                    >
                      Finance Pre-Approval
                    </a>
                    <a
                      className="btn btn-outline-primary cs-pill"
                      href="tel:0418908870"
                    >
                      Call 0418908870
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-cash-stack"></i>
                </span>
                <h3 className="h5 fw-bold">No-Deposit Finance</h3>
                <p className="text-secondary mb-0">
                  Finance options for approved applicants from our Ormiston hub.
                </p>
              </article>
            </div>
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-briefcase"></i>
                </span>
                <h3 className="h5 fw-bold">ABN Specialist</h3>
                <p className="text-secondary mb-0">
                  Specialist ABN and low-doc support for Brisbane tradies.
                </p>
              </article>
            </div>
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-truck"></i>
                </span>
                <h3 className="h5 fw-bold">QLD Delivery</h3>
                <p className="text-secondary mb-0">
                  Delivery support from Brisbane to regional Queensland.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
