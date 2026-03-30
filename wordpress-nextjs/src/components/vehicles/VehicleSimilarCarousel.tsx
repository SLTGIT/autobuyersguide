"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export interface SimilarCarItem {
  slug: string;
  title: string;
  image: string | null;
  condition: string;
  price: string;
  odometer: string | null;
  location: string;
  tags: string[];
}

interface VehicleSimilarCarouselProps {
  items: SimilarCarItem[];
}

export default function VehicleSimilarCarousel({ items }: VehicleSimilarCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth * 0.85;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="vdp-similar" aria-labelledby="vdp-similar-heading">
      <div className="vdp-similar-head">
        <h2 id="vdp-similar-heading" className="vdp-similar-title">
          Similar cars in stock
        </h2>
        <div className="vdp-similar-nav">
          <button
            type="button"
            className="vdp-carousel-btn"
            onClick={() => scrollBy(-1)}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className="vdp-carousel-btn"
            onClick={() => scrollBy(1)}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>
      <div className="vdp-similar-scroller" ref={scrollerRef} role="list">
        {items.map((car) => (
          <article key={car.slug} className="vdp-similar-card" role="listitem">
            <Link href={`/cars/${car.slug}`} className="vdp-similar-card-link">
              <div className="vdp-similar-card-media">
                {car.image ? (
                  <Image
                    src={car.image}
                    alt=""
                    width={320}
                    height={220}
                    className="vdp-similar-card-img"
                  />
                ) : (
                  <div className="vdp-similar-card-placeholder">No image</div>
                )}
                <span
                  className={`vdp-similar-badge ${
                    car.condition.toLowerCase() === "new" ? "is-new" : "is-used"
                  }`}
                >
                  {car.condition}
                </span>
              </div>
              <h3 className="vdp-similar-card-title">{car.title}</h3>
              {car.tags.length > 0 && (
                <ul className="vdp-similar-card-tags">
                  {car.tags.slice(0, 4).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              {car.odometer ? (
                <p className="vdp-similar-card-km">{car.odometer}</p>
              ) : null}
              <p className="vdp-similar-card-price">{car.price || "—"}</p>
              {car.location ? (
                <p className="vdp-similar-card-loc">{car.location}</p>
              ) : null}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
