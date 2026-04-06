"use client";

import {
  FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.scss";

type SearchHit = {
  slug: string;
  label: string;
  price: string;
  image: string | null;
};

export default function HeaderSearch() {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [noMatches, setNoMatches] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) closeDropdown();
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [closeDropdown]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setNoMatches(false);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setNoMatches(false);
      try {
        const res = await fetch(
          `/api/inventory/search?q=${encodeURIComponent(term)}`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results?: SearchHit[] };
        const list = data.results ?? [];
        if (!ac.signal.aborted) {
          setResults(list);
          setNoMatches(list.length === 0);
          setActive(-1);
        }
      } catch {
        if (ac.signal.aborted) return;
        setResults([]);
        setNoMatches(true);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [q]);

  const showPanel =
    open &&
    q.trim().length >= 2 &&
    (loading || results.length > 0 || noMatches);

  const goSearch = () => {
    const trimmed = q.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    closeDropdown();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (active >= 0 && results[active]) {
      closeDropdown();
      router.push(`/cars/${results[active].slug}`);
      return;
    }
    goSearch();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel && e.key !== "Escape") return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!results.length) return;
      setActive((i) => (i + 1) % results.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  return (
    <div className={styles["header-search-wrap"]} ref={rootRef}>
      <form
        className={styles["header-search"]}
        onSubmit={onSubmit}
        role="search"
        aria-label="Search vehicles"
      >
        <span className={styles["header-search__icon"]} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          className={styles["header-search__input"]}
          placeholder="Search Car..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          aria-label="Search by make or model"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-activedescendant={
            showPanel && active >= 0 ? `${listId}-${active}` : undefined
          }
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </form>

      {showPanel && (
        <div
          id={listId}
          className={styles["header-search__dropdown"]}
          role="listbox"
          aria-label="Matching vehicles"
        >
          {loading && (
            <div className={styles["header-search__status"]} role="status">
              Searching…
            </div>
          )}
          {!loading && noMatches && (
            <div className={styles["header-search__status"]}>
              No vehicles match.{" "}
              <button type="button" className={styles["header-search__link"]} onClick={goSearch}>
                View all filters
              </button>
            </div>
          )}
          {!loading &&
            results.map((hit, i) => (
              <Link
                key={`${hit.slug}-${i}`}
                id={`${listId}-${i}`}
                href={`/cars/${hit.slug}`}
                className={`${styles["header-search__item"]} ${i === active ? styles["is-active"] : ""}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => closeDropdown()}
              >
                <div className={styles["header-search__thumb"]}>
                  {hit.image ? (
                    <Image
                      src={hit.image}
                      alt=""
                      width={72}
                      height={54}
                      className={styles["header-search__img"]}
                      unoptimized
                    />
                  ) : (
                    <div className={styles["header-search__placeholder"]} aria-hidden />
                  )}
                </div>
                <div className={styles["header-search__meta"]}>
                  <span className={styles["header-search__line"]}>{hit.label}</span>
                  <span className={styles["header-search__price"]}>{hit.price}</span>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
