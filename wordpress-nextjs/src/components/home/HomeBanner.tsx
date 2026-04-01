import Image from "next/image";
import SearchForm from "./SearchForm";
import styles from "./HomeBanner.module.scss";

export default function HomeBanner() {
  return (
    <section className={styles["home-banner"]} aria-label="Find a car">
      <div className={styles["home-banner__media"]}>
        <Image
          src="/assets/images/banner-1.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles["home-banner__img"]}
        />
        <div className={styles["home-banner__overlay"]} aria-hidden />
        <div className={`container-mid ${styles["home-banner__copy-wrap"]}`}>
          <div
            className={styles["banner-content"]}
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <h1 className={styles["banner-heading"]}>
              Australia&apos;s{" "}
              <span className={styles["banner-emphasis"]}>Trusted {" "}</span>
              Marketplace for Used Cars
            </h1>
            <p className={styles["banner-subtext"]}>
              Explore thousands of verified used car listings across Australia.
            </p>
          </div>
        </div>
      </div>

      <div className={styles["home-banner__search"]}>
        <div className="container-mid">
          <SearchForm embedded />
        </div>
      </div>
    </section>
  );
}
