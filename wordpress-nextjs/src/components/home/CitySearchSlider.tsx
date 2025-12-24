'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CitySearchSlider.module.scss';

const cities = [
    { name: 'Used Cars Melbourne', slug: 'used-cars-melbourne', image: '/assets/images/austrailian-cities/victoria.webp' },
    { name: 'Used Cars Brisbane', slug: 'used-cars-brisbane', image: '/assets/images/austrailian-cities/brisbane.webp' },
    { name: 'Used Cars SC', slug: 'used-cars-sunshine-coast', image: '/assets/images/austrailian-cities/sunshine-coast-queensland.webp' },
    { name: 'Used Cars Gold Coast', slug: 'used-cars-gold-coast', image: '/assets/images/austrailian-cities/gold-coast-queensland.webp' },
    { name: 'Used Cars Perth', slug: 'used-cars-perth', image: '/assets/images/austrailian-cities/western-australia.webp' },
    { name: 'Used Cars FNQ', slug: 'used-cars-far-north-queensland', image: '/assets/images/austrailian-cities/queensland.webp' },
    { name: 'Used Cars Regional NSW', slug: 'used-cars-regional-nsw', image: '/assets/images/austrailian-cities/new-south-wales.webp' },
];

export default function CitySearchSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 600) setItemsPerView(1);
            else if (window.innerWidth < 992) setItemsPerView(2);
            else setItemsPerView(3);
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, cities.length - itemsPerView);

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    // Calculate translation percentage
    // Based on CSS: calc((100% - 52px) / 3) + 26px gap
    // Actually, simpler to think: each item takes up (100% / itemsPerView) space roughly including gap distribution for calculation if we used flex basis math in JS.
    // The CSS defines flex basis. We just need to translate by 1 item's "slot".
    // 1 item flux basis + gap.
    // The gap is 26px. 
    // It's safer to use percentage if the gap was % based, but it's px based.
    // Let's rely on the container width.
    // Movement = (100% + gap) / itemsPerView ? No.
    // If 3 items are visible, we move 1/3 of the container width PLUS the gap adjustment?
    // Actually, `translateX` percentage is relative to the ELEMENT width (the `_inner` wrapper), which grows with content?
    // No, `_inner` is flexbox.
    // Let's simpler logic:
    // Move by (Index * (100% / ItemsPerView))? 
    // No, because of the fixed 26px gap.
    
    // Alternative: Just use standard pixel translation based on computed slide width.
    // Or simplified percentage approximation which might be slightly off but acceptable.
    // Let's use Style translation with calc.
    // translate = - (index * (100% / itemsPerView + gapAdjustment)) ?
    // CSS: flex: 0 0 calc((100% - 52px) / 3); -> 3 items with 2 gaps of 26px (total 52px) fill 100%.
    // So 1 item + 1 gap = (100% - 52px)/3 + 26px = (100% - 52px + 78px)/3 = (100% + 26px)/3.
    // So translate X = index * calc((100% + 26px) / itemsPerView).
    
    // For 2 items: flex: 0 0 calc((100% - 26px) / 2); Gap 26.
    // 1 item + 1 gap = (100% - 26 + 26)/2 = 100%/2 + 13? No.
    // (100% - 26)/2 + 26 = (100% - 26 + 52)/2 = (100% + 26)/2.
    
    // For 1 item: flex: 0 0 100%. Gap 26.
    // 1 item + 1 gap = 100% + 26px.
    
    // Generic Formula: calc((100% + 26px) / itemsPerView * index * -1)
    
    const translateStyle = {
        transform: `translateX(calc(((100% + 26px) / ${itemsPerView}) * -${currentIndex}))`
    };

    return (
        <section className={`${styles.searchByCity} js-slider`}>
            <div className="container-mid position-relative"> {/* Added position relative for absolute nav alignment */}
                <div className="main-heading mb-4" data-aos="fade-up" data-aos-duration="1200">
                    <h2>Let’s Discover Cities</h2>
                </div>

                <div className={styles.sliderNavs} data-aos="fade-up" data-aos-duration="1200">
                    <button 
                        className={`${styles.sliderBtn} ${styles.sliderPrev} ${currentIndex === 0 ? styles.disabled : ''}`} 
                        onClick={prevSlide} 
                        aria-label="Previous"
                        disabled={currentIndex === 0}
                    >
                        ‹
                    </button>
                    <button 
                        className={`${styles.sliderBtn} ${styles.sliderNext} ${currentIndex >= maxIndex ? styles.disabled : ''}`} 
                        onClick={nextSlide} 
                        aria-label="Next"
                        disabled={currentIndex >= maxIndex}
                    >
                        ›
                    </button>
                </div>

                <div className={`${styles.girdBoxContainer} position-relative overflow-hidden`}>
                    <div className={`${styles.inner} d-flex flex-nowrap`} style={translateStyle}>
                        {cities.map((city, index) => (
                            <div key={index} className={`${styles.cityBox} ${styles.boxSlider}`} data-aos="fade-up" data-aos-duration="1200" data-aos-delay={index * 150}>
                                <Link 
                                    href={`/${city.slug}`}
                                    style={{ backgroundImage: `url('${city.image}')` }}
                                >
                                    <div className={styles.cityBoxContent}>
                                        <div className={styles.cityBoxIcon}>
                                            <Image 
                                                src="/assets/images/icons/location.webp" 
                                                alt="location" 
                                                width={24} 
                                                height={24} 
                                            />
                                        </div>
                                        <h3 className={styles.cityName}>{city.name}</h3>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
