import "./Header.scss";
import HeaderNavbar from "./HeaderNavbar";
import GoogleRatingStars from "@/components/GoogleRatingStars";
import { CAR_SALES_BRISBANE_GOOGLE_MAPS_URL, formatReviewSummaryLine, getGoogleReviews } from "@/lib/google-reviews";

const FALLBACK_SCORE = 4.8;
const FALLBACK_LINE = "4.8 RATING OUT OF 240 REVIEWS";

export default async function Header() {
  const summary = await getGoogleReviews();
  const score = summary?.averageScore ?? FALLBACK_SCORE;
  const summaryLine = summary ? formatReviewSummaryLine(summary) : FALLBACK_LINE;

  return (
    <header className="sticky-top cs-header">
      <div className="cs-topbar py-0 py-3 py-lg-0">
        <div className="container d-flex flex-wrap justify-content-center justify-content-lg-end align-items-center gap-3 gap-lg-4 ">
          <a
            className="d-inline-flex align-items-center gap-2 text-decoration-none text-body"
            target="_blank"
            rel="noopener noreferrer"
            href={CAR_SALES_BRISBANE_GOOGLE_MAPS_URL}
            aria-label={`Google reviews: ${summaryLine}`}
          >
            <GoogleRatingStars score={score} />
            <span style={{ fontSize: "0.82rem", lineHeight: "1", color: "#fff" }}>{summaryLine}</span>
          </a>
          <a
            className="d-inline-flex align-items-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
            href={CAR_SALES_BRISBANE_GOOGLE_MAPS_URL}
          >
            <i className="bi bi-geo-alt-fill"></i>
            <span>56 Freeth St W, Ormiston QLD 4160, Australia</span>
          </a>
          <a className="d-inline-flex align-items-center gap-2" href="tel:0418908870">
            <i className="bi bi-telephone-fill"></i>
            <span>0418908870</span>
          </a>
          <span className="d-inline-flex align-items-center gap-3">
            <a href="https://www.facebook.com/share/1DREXJCBhb/?mibextid=wwXIfr" target="_blank" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a
              href="https://www.instagram.com/carsalesbrisbaneau?igsh=MTg5bmtic2hjdnNzMg%3D%3D&utm_source=qr"
              target="_blank"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://www.tiktok.com/@carsalesbrisbane?_r=1&_t=ZS-95OLtLR1kfQ" target="_blank" aria-label="TikTok">
              <i className="bi bi-tiktok"></i>
            </a>
          </span>
        </div>
      </div>
      <HeaderNavbar />
    </header>
  );
}
