"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GoogleRatingStars from "@/components/GoogleRatingStars";
import { stripLeadingStarEmojis, type GoogleReviewItem } from "@/lib/google-reviews";
import styles from "./GoogleReviewsSlider.module.scss";

export type GoogleReviewsSliderProps = {
  reviews: GoogleReviewItem[];
  averageScore: number;
  reviewCount: number | null;
  mapsUrl: string;
  fallbackQuote: string;
  fallbackAuthor: string;
};

function formatReviewDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

function reviewBody(r: GoogleReviewItem): string {
  if (!r.text) return "";
  return stripLeadingStarEmojis(r.text).trim();
}

export default function GoogleReviewsSlider({
  reviews,
  averageScore,
  reviewCount,
  mapsUrl,
  fallbackQuote,
  fallbackAuthor,
}: GoogleReviewsSliderProps) {
  const slides = useMemo((): GoogleReviewItem[] => {
    if (reviews.length > 0) return reviews;
    return [
      {
        user: fallbackAuthor,
        user_photo: "",
        text: fallbackQuote,
        rating: String(averageScore),
        date: "",
      },
    ];
  }, [reviews, fallbackAuthor, fallbackQuote, averageScore]);

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const regionRef = useRef<HTMLElement | null>(null);

  const n = slides.length;
  const safeIndex = ((index % n) + n) % n;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return n - 1;
        if (next >= n) return 0;
        return next;
      });
    },
    [n],
  );

  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const d = touchStartX.current - endX;
    touchStartX.current = null;
    if (d > 56) go(1);
    else if (d < -56) go(-1);
  };

  return (
    <section className={styles.section} ref={regionRef} tabIndex={0} aria-label="Customer reviews from Google">
      <div className="container">
        <header className={styles.headerRow}>
          <div className={styles.headerTitles}>
            {/* <p className={styles.kicker}>Customer Reviews</p> */}
            <h2 className={`display-6 fw-bold cs-title-tight ${styles.title}`}>What Our Customers Say</h2>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.aggregate}>
              <GoogleRatingStars score={averageScore} />
              {reviewCount != null ? (
                <p className={styles.aggregateText}>
                  <span className={styles.aggregateScore}>{averageScore.toFixed(1)}</span>
                  <span className={styles.aggregateSep}>/</span> 5
                  <span className={styles.aggregateDot}>·</span>
                  {reviewCount} Google review{reviewCount === 1 ? "" : "s"}
                </p>
              ) : (
                <p className={styles.aggregateText}>Google Business Profile</p>
              )}
            </div>
            <div className={styles.nav}>
              <button type="button" className={styles.navBtn} onClick={() => go(-1)} aria-label="Previous review">
                <i className="bi bi-chevron-left fs-5" aria-hidden />
              </button>
              <button type="button" className={styles.navBtn} onClick={() => go(1)} aria-label="Next review">
                <i className="bi bi-chevron-right fs-5" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <div
          className={styles.testimonialShell}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Review ${safeIndex + 1} of ${n}`}
        >
          <span className={styles.quoteMark} aria-hidden>
            &ldquo;
          </span>
          <div className={styles.track} style={{ transform: `translateX(-${safeIndex * 100}%)` }}>
            {slides.map((r, i) => {
              const b = reviewBody(r);
              const rs = Number.parseFloat(r.rating);
              const sc = Number.isFinite(rs) ? rs : averageScore;
              return (
                <div
                  key={`${r.user}-${r.date}-${i}`}
                  className={styles.slide}
                  aria-hidden={i !== safeIndex}
                >
                  <blockquote className={styles.quote}>
                    {b ? (
                      <>
                        <span className="visually-hidden">Quote: </span>
                        {b}
                      </>
                    ) : (
                      <span className={styles.quoteEmpty}>No written review for this rating.</span>
                    )}
                  </blockquote>
                  <footer className={styles.authorBar}>
                    {r.user_photo ? (
                      <Image
                        src={r.user_photo}
                        alt=""
                        width={56}
                        height={56}
                        className={styles.avatar}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.avatarFallback} aria-hidden>
                        <i className="bi bi-person-fill" />
                      </div>
                    )}
                    <div className={styles.authorMetaBlock}>
                      <cite className={styles.authorName}>{r.user}</cite>
                      <div className={styles.authorSub}>
                        <GoogleRatingStars score={sc} className={styles.authorStars} />
                        {r.date ? <time className={styles.date}>{formatReviewDate(r.date)}</time> : null}
                      </div>
                    </div>
                  </footer>
                </div>
              );
            })}
          </div>
        </div>

        {n > 1 ? (
          <div className={styles.dotsRow}>
            <div className={styles.dots} role="tablist" aria-label="Select review">
              {slides.map((r, i) => (
                <button
                  key={`dot-${r.user}-${r.date}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  aria-label={`Show review ${i + 1} of ${n}`}
                  className={`${styles.dot} ${i === safeIndex ? styles.dotActive : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <p className={styles.counter}>
              {safeIndex + 1} / {n}
            </p>
          </div>
        ) : null}

        <p className={styles.googleFoot}>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.googleLink}>
            Read all reviews on Google
            <i className="bi bi-arrow-up-right ms-1" aria-hidden style={{ fontSize: "0.85em" }} />
          </a>
        </p>
      </div>
    </section>
  );
}
