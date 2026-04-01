"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  parseInventorySearchParams,
  serializeInventoryFilters,
} from "@/lib/inventory/query";
import { brandLogoPublicPathFromSlug } from "@/lib/inventory/brand-logo";
import { mergeFeaturedBrandsWithApi } from "@/lib/inventory/featured-brands";
import styles from "./PopularBrandsSlider.module.scss";

type BrandRow = {
  name: string;
  count: number;
  make: string;
};

function makeBrandHref(makeLower: string): string {
  const base = parseInventorySearchParams({});
  return `/search?${serializeInventoryFilters({
    ...base,
    make: makeLower,
    page: 1,
  })}`;
}

function BrandLogo({ logoSlug, label }: { logoSlug: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const src = brandLogoPublicPathFromSlug(logoSlug);

  if (failed) {
    return (
      <div className={styles.makeLogoFallback} aria-hidden>
        {label.trim().slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      title={label}
      width={100}
      height={100}
      onError={() => setFailed(true)}
    />
  );
}

export default function PopularBrandsSlider() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch("/api/inventory/makes");
        const data = (await res.json()) as { brands?: BrandRow[] };
        if (!cancelled) {
          const api = Array.isArray(data.brands) ? data.brands : [];
          setBrands(mergeFeaturedBrandsWithApi(api));
          if (!res.ok) setLoadError(true);
        }
      } catch {
        if (!cancelled) {
          setBrands(mergeFeaturedBrandsWithApi([]));
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 575) setItemsPerView(2);
      else if (window.innerWidth < 992) setItemsPerView(3);
      else if (window.innerWidth < 1200) setItemsPerView(5);
      else setItemsPerView(6);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [brands.length]);

  const maxIndex = Math.max(0, brands.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const translateStyle = {
    transform: `translateX(calc(((100% + 26px) / ${itemsPerView}) * -${currentIndex}))`,
  };

  const itemStyle = {
    flex: `0 0 calc((100% - (26px * (${itemsPerView} - 1))) / ${itemsPerView})`,
  };

  return (
    <section className={`${styles.popularMakes} js-slider`}>
      <div className="container-mid">
        <div
          className={`main-heading mb-4 ${styles.mainHeading}`}
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          <h2>Popular Car Brands</h2>
          <div
            className={styles.sliderNavs}
            data-aos="fade-up"
            data-aos-duration="1200"
          >
            <button
              type="button"
              className={`${styles.sliderBtn} ${styles.sliderPrev} ${currentIndex === 0 ? styles.disabled : ""}`}
              onClick={prevSlide}
              aria-label="Previous"
              disabled={currentIndex === 0 || brands.length === 0}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.sliderBtn} ${styles.sliderNext} ${currentIndex >= maxIndex ? styles.disabled : ""}`}
              onClick={nextSlide}
              aria-label="Next"
              disabled={currentIndex >= maxIndex || brands.length === 0}
            >
              ›
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-muted py-4 mb-0" role="status">
            Loading brands…
          </p>
        )}

        {!loading && loadError && (
          <p className="text-center text-muted small mb-3 mb-lg-4" role="status">
            Stock counts unavailable — links still work.{" "}
            <Link href="/search" className="text-decoration-underline">
              Browse all vehicles
            </Link>
          </p>
        )}

        {!loading && brands.length > 0 && (
          <div
            className={`${styles.gridBoxContainer} position-relative overflow-hidden`}
          >
            <div
              className={`${styles.inner} d-flex flex-nowrap`}
              style={translateStyle}
            >
              {brands.map((brand, index) => (
                <div
                  key={brand.make}
                  className={`${styles.makeBox} ${styles.boxSlider}`}
                  style={itemStyle}
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay={Math.min(index, 12) * 50}
                >
                  <Link
                    href={makeBrandHref(brand.make)}
                    className={styles.makeGridItem}
                  >
                    <div className={styles.makeLogo}>
                      <BrandLogo logoSlug={brand.make} label={brand.name} />
                    </div>
                    <h3 className={styles.makeName}>{brand.name}</h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="text-center"
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          <Link
            href="/search"
            className="theme-btn white-btn mt-4 d-inline-block px-4 py-2"
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              textDecoration: "none",
              color: "var(--dark-color)",
              fontWeight: 700,
            }}
          >
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
}
