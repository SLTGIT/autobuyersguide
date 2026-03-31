"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  parseInventorySearchParams,
  serializeInventoryFilters,
} from "@/lib/inventory/query";
import type { InventoryFilterState } from "@/types/inventory";
import styles from "./SearchForm.module.scss";

type Tab = "new" | "used";

interface SearchFormProps {
  /** When true, sits inside the home hero (no beige band, tighter offset). */
  embedded?: boolean;
}

function buildSearchState(
  tab: Tab,
  make: string,
  model: string,
  location: string
): InventoryFilterState {
  const base = parseInventorySearchParams({});
  const qParts = [model, location].filter(Boolean);
  const q = qParts.join(" ").toLowerCase();
  return {
    ...base,
    condition: tab === "new" ? "New" : "Used",
    make: make.trim().toLowerCase(),
    q,
    page: 1,
  };
}

export default function SearchForm({ embedded = false }: SearchFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("used");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const make = String(fd.get("make") ?? "");
    const model = String(fd.get("model") ?? "");
    const location = String(fd.get("location") ?? "");
    const f = buildSearchState(activeTab, make, model, location);
    const qs = serializeInventoryFilters(f);
    router.push(qs ? `/search?${qs}` : "/search");
  };

  const sectionClass = embedded
    ? `${styles["main-search-form"]} ${styles["main-search-form--embedded"]}`
    : styles["main-search-form"];

  const formBlock = (
    <div
      className={`${styles["homeBanner-form"]} ${embedded ? styles["homeBanner-form--embedded"] : ""}`}
      data-aos="fade-up"
      data-aos-duration="1200"
      data-aos-delay="200"
    >
      <ul className={`nav ${styles["nav-tabs"]}`} role="tablist">
        {/* <li className={styles["nav-item"]} role="presentation">
          <button
            className={`${styles["nav-link"]} ${activeTab === "new" ? styles.active : ""}`}
            onClick={() => setActiveTab("new")}
            type="button"
          >
            New
          </button>
        </li> */}
        <li className={styles["nav-item"]} role="presentation">
          <button
            className={`${styles["nav-link"]} ${activeTab === "used" ? styles.active : ""}`}
            onClick={() => setActiveTab("used")}
            type="button"
          >
            Used
          </button>
        </li>
        {/* Demo — hidden until inventory supports a distinct demo condition in the feed
        <li className={styles['nav-item']} role="presentation">
          <button type="button" className={styles['nav-link']}>Demo</button>
        </li>
        */}
      </ul>

      <div className={styles["tab-content"]}>
        {activeTab === "new" && (
          <form
            className="d-flex align-items-center gap-3 w-100 flex-wrap flex-lg-nowrap"
            onSubmit={onSubmit}
          >
            <div className="d-flex flex-grow-1 gap-3 w-100">
              <div className={styles["form-group"]}>
                <select
                  className={`form-select ${styles["form-select"]}`}
                  name="make"
                  aria-label="Select Make"
                  defaultValue=""
                >
                  <option value="">Select Make</option>
                  <option value="Kia">Kia</option>
                  <option value="Toyota">Toyota</option>
                  <option value="MG">MG</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Hyundai">Hyundai</option>
                </select>
              </div>
              <div className={styles["form-group"]}>
                <select
                  className={`form-select ${styles["form-select"]}`}
                  name="model"
                  aria-label="Select Model"
                  defaultValue=""
                >
                  <option value="">Select Model</option>
                  <option value="Sportage">Sportage</option>
                  <option value="Corolla">Corolla</option>
                  <option value="Model 3">Model 3</option>
                  <option value="i30">i30</option>
                </select>
              </div>
              <div className={styles["form-group"]}>
                <select
                  className={`form-select ${styles["form-select"]}`}
                  name="location"
                  aria-label="Select Location"
                  defaultValue=""
                >
                  <option value="">Select Location</option>
                  <option value="nsw">NSW</option>
                  <option value="vic">VIC</option>
                  <option value="qld">QLD</option>
                  <option value="wa">WA</option>
                  <option value="sa">SA</option>
                  <option value="tas">TAS</option>
                  <option value="act">ACT</option>
                  <option value="nt">NT</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`btn btn-danger ${styles["theme-btn"]}`}>
              <span className={styles["theme-btn-inner"]} aria-hidden>
                🔍
              </span>{" "}
              Search new stock
            </button>
          </form>
        )}

        {activeTab === "used" && (
          <form
            className="d-flex align-items-center gap-3 w-100 flex-wrap flex-lg-nowrap"
            onSubmit={onSubmit}
          >
            <div className="d-flex flex-grow-1 gap-3 w-100">
              <div className={styles["form-group"]}>
                <select
                  className={`form-select ${styles["form-select"]}`}
                  name="make"
                  aria-label="Select Make"
                  defaultValue=""
                >
                  <option value="">Select Make</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Ford">Ford</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                </select>
              </div>
              <div className={styles["form-group"]}>
                <select
                  className={`form-select ${styles["form-select"]}`}
                  name="model"
                  aria-label="Select Model"
                  defaultValue=""
                >
                  <option value="">Select Model</option>
                  <option value="Corolla">Corolla</option>
                  <option value="Camry">Camry</option>
                  <option value="Hilux">Hilux</option>
                  <option value="Ranger">Ranger</option>
                  <option value="i30">i30</option>
                </select>
              </div>
              <div className={styles["form-group"]}>
                <select
                  className={`form-select ${styles["form-select"]}`}
                  name="location"
                  aria-label="Select Location"
                  defaultValue=""
                >
                  <option value="">Select Location</option>
                  <option value="nsw">NSW</option>
                  <option value="vic">VIC</option>
                  <option value="qld">QLD</option>
                  <option value="wa">WA</option>
                  <option value="sa">SA</option>
                  <option value="tas">TAS</option>
                  <option value="act">ACT</option>
                  <option value="nt">NT</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`btn btn-danger ${styles["theme-btn"]}`}>
              <span className={styles["theme-btn-inner"]} aria-hidden>
                🔍
              </span>{" "}
              Search used stock
            </button>
          </form>
        )}

        {/* Demo tab — disabled until feed exposes a distinct demo condition
        {activeTab === 'demo' && ( ... )}
        */}

        <div className="d-flex justify-content-end mt-2">
          <Link href="/search" className={`${styles["arrow-cta"]} small fw-bold`}>
            Full inventory search
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <section className={sectionClass}>
      {embedded ? formBlock : <div className="container-mid">{formBlock}</div>}
    </section>
  );
}
