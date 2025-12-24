'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PopularBrandsSlider.module.scss';

const brands = [
    { name: 'Toyota', image: '/assets/images/brand-logo/toyota.webp' },
    { name: 'Ford', image: '/assets/images/brand-logo/ford.webp' },
    { name: 'Mazda', image: '/assets/images/brand-logo/mazda.webp' },
    { name: 'Hyundai', image: '/assets/images/brand-logo/hyundai.webp' },
    { name: 'Kia', image: '/assets/images/brand-logo/kia.webp' },
    { name: 'Mitsubishi', image: '/assets/images/brand-logo/mitsubishi.webp' },
    { name: 'Tesla', image: '/assets/images/brand-logo/tesla.webp' },
    { name: 'Subaru', image: '/assets/images/brand-logo/subaru.webp' },
    { name: 'BMW', image: '/assets/images/brand-logo/bmw.webp' },
    { name: 'Volkswagen', image: '/assets/images/brand-logo/volkswagen.webp' },
];

export default function PopularBrandsSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(6); // Desktop default

    useEffect(() => {
        const handleResize = () => {
            // Matching CSS/Data attributes roughly
            // data-slides-desktop="6" data-slides-laptop="5" data-slides-tablet="3" data-slides-mobile="2"
            if (window.innerWidth < 575) setItemsPerView(2);
            else if (window.innerWidth < 992) setItemsPerView(3);
            else if (window.innerWidth < 1200) setItemsPerView(5);
            else setItemsPerView(6);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, brands.length - itemsPerView);

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    // Note: The CSS logic for items per view in PopularMakes was not explicitly computed with a flex-basis calc in the provided SCSS?
    // Let's check _home.scss.
    // .box-slider { flex: 0 0 auto; }
    // It says "Width is handled by JS".
    // Ah, so I need to set the width of the items explicitly or use flex-basis in inline styles if I want specific items per view.
    // Or I can update the SCSS.
    // The SCSS comment says: "Width is handled by JS based on container width and gap".
    // I will emulate this by setting flex-basis via inline style.
    
    // Formula: (100% - (gap * (itemsPerView - 1))) / itemsPerView
    // Gap is 26px.
    // width = calc( (100% - (26px * (itemsPerView - 1))) / itemsPerView )
    
    // transform formula:
    // translateX( -index * (itemWidth + gap) )
    // itemWidth + gap = (100% - (gap * (items-1)))/items + gap
    // = (100% - gap*items + gap)/items + gap
    // = 100%/items - gap + gap/items + gap
    // = 100%/items + gap/items
    // = (100% + gap) / items
    
    // So same formula as CitySearch: calc((100% + 26px) / itemsPerView) * index

    const translateStyle = {
        transform: `translateX(calc(((100% + 26px) / ${itemsPerView}) * -${currentIndex}))`
    };
    
    const itemStyle = {
        flex: `0 0 calc((100% - (26px * (${itemsPerView} - 1))) / ${itemsPerView})`
    };

    return (
        <section className={`${styles.popularMakes} js-slider`}>
            <div className="container-mid">
                <div className={`main-heading mb-4 ${styles.mainHeading}`} data-aos="fade-up" data-aos-duration="1200">
                    <h2>Popular Car Brands</h2>
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
                </div>


                <div className={`${styles.gridBoxContainer} position-relative overflow-hidden`}>
                    <div className={`${styles.inner} d-flex flex-nowrap`} style={translateStyle}>
                        {brands.map((brand, index) => (
                            <div key={index} className={`${styles.makeBox} ${styles.boxSlider}`} style={itemStyle} data-aos="fade-up" data-aos-duration="1200" data-aos-delay={index * 100}>
                                <Link href="#" className={styles.makeGridItem}>
                                    <div className={styles.makeLogo}>
                                        <Image 
                                            src={brand.image} 
                                            alt={brand.name} 
                                            title={brand.name}
                                            width={100} 
                                            height={100} 
                                        />
                                    </div>
                                    <h3 className={styles.makeName}>{brand.name}</h3>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center" data-aos="fade-up" data-aos-duration="1200">
                    <Link href="#" className="theme-btn white-btn mt-4 d-inline-block px-4 py-2" style={{border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', color: 'var(--dark-color)', fontWeight: 700}}>
                        View All Brands
                    </Link>
                </div>
            </div>
        </section>
    );
}
