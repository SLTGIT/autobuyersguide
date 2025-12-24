import Image from 'next/image';
import styles from './HomeBanner.module.scss';

export default function HomeBanner() {
  return (
    <section className={styles['home-banner']}>
      <div className={styles['homeBanner-image']}>
        <Image
          src="/assets/images/home-banner.webp"
          alt="Banner Image"
          width={1920}
          height={500}
          priority
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      <div className="container-mid">
        <div className={styles['home-banner-title']}>
          <div className={styles['banner-content']} data-aos="fade-up" data-aos-duration="1200">
            <h1>Used Cars for Sale. <br /> Your Trusted Car Buying Partner</h1>
            <p className={styles['banner-subtext']}>
              Search over 15000+ new & used cars for sale from trusted dealers & private sellers.
              We make it easy to find your perfect car.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
