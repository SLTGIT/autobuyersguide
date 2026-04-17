import "./Header.scss";
import HeaderNavbar from "./HeaderNavbar";

export default function Header() {
  return (
    <header className="sticky-top cs-header">
      <div className="cs-topbar py-0 py-3 py-lg-0">
        <div className="container d-flex flex-wrap justify-content-center justify-content-lg-end align-items-center gap-3 gap-lg-4 ">
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
            target="_blank"
            href="https://www.google.com/maps/place/Car+Sales+Brisbane/@-27.5224896,153.2562743,17z/data=!3m1!4b1!4m6!3m5!1s0x6b91678932e7fccd:0x6a000d7f9589579b!8m2!3d-27.5224896!4d153.2562743!16s%2Fg%2F11vqstz67d?entry=ttu&g_ep=EgoyMDI2MDQwNi4wIKXMDSoASAFQAw%3D%3D"
          >
            <i className="bi bi-geo-alt-fill"></i>
            <span>Car Sales Brisbane</span>
          </a>
          <a
            className="d-inline-flex align-items-center gap-2"
            href="tel:0418908870"
          >
            <i className="bi bi-telephone-fill"></i>
            <span>0418908870</span>
          </a>
          <span className="d-inline-flex align-items-center gap-3">
            <a href="https://www.facebook.com/share/1DREXJCBhb/?mibextid=wwXIfr" target="_blank" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://www.instagram.com/carsalesbrisbaneau?igsh=MTg5bmtic2hjdnNzMg%3D%3D&utm_source=qr" target="_blank" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://www.tiktok.com/@carsalesbrisbane?_r=1&_t=ZS-95OLtLR1kfQ" target="_blank" aria-label="TikTok">
              <i className="bi bi-tiktok"></i>
            </a>
            {/* <a href="#" aria-label="YouTube">
              <i className="bi bi-youtube"></i>
            </a> */}
          </span>
        </div>
      </div>
      <HeaderNavbar />
    </header>
  );
}
