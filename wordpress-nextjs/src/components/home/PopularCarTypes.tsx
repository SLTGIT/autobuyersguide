import Link from "next/link";
import Image from "next/image";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { getPopularCarTypeItems } from "@/lib/inventory/popular-body-types";
import styles from "./PopularCarTypes.module.scss";

export default async function PopularCarTypes() {
  let items = getPopularCarTypeItems([]);
  try {
    const vehicles = await fetchDealerInventory();
    items = getPopularCarTypeItems(vehicles);
  } catch {
    // Env missing or feed error — keep zero counts; links still point to /search
  }

  return (
    <section className={styles.popularCarType}>
      <div className="container-mid">
        <div
          className="main-heading mb-4"
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          <h2>Browse Used Cars by Body Type</h2>
        </div>
        <div className={`row ${styles.gxCustom}`}>
          {items.map((type, index) => (
            <div
              key={type.title}
              className={`col-6 col-lg-4 col-md-6 ${styles.colItem}`}
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-delay={index * 150}
            >
              <Link className={styles.popularCarGrid} href={type.href}>
                <div className={styles.popularCarGridTitle}>
                  <h3>{type.title}</h3>
                  <p>{type.countLabel}</p>
                </div>
                <div className={styles.popularCarGridImg}>
                  <Image
                    src={type.image}
                    alt=""
                    title={type.title}
                    width={236}
                    height={250}
                    className="img-fluid"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
