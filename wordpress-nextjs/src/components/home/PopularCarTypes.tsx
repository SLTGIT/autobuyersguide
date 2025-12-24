import Link from 'next/link';
import Image from 'next/image';
import styles from './PopularCarTypes.module.scss';


const carTypes = [
    { title: 'Used SUVs for Sale', count: '2992 Cars', image: '/assets/images/aus-car-types/suv.webp' },
    { title: 'Used Utes for Sale', count: '1202 Cars', image: '/assets/images/aus-car-types/utility.webp' },
    { title: 'Used Hatchbacks', count: '634 Cars', image: '/assets/images/aus-car-types/hatchback.webp' },
    { title: 'Used Sedans', count: '616 Cars', image: '/assets/images/aus-car-types/seadn.webp' },
    { title: 'Used 4WD Vehicles', count: '117 Cars', image: '/assets/images/aus-car-types/4wd.webp' },
    { title: 'Used Family Cars', count: '117 Cars', image: '/assets/images/aus-car-types/van.webp' },
];

export default function PopularCarTypes() {
    return (
        <section className={styles.popularCarType}>
            <div className="container-mid">
                <div className="main-heading mb-4" data-aos="fade-up" data-aos-duration="1200">
                    <h2>Browse Used Cars by Body Type</h2>
                </div>
                <div className={`row ${styles.gxCustom}`}>
                    {carTypes.map((type, index) => (
                        <div key={index} className={`col-6 col-lg-4 col-md-6 ${styles.colItem}`} data-aos="fade-up" data-aos-duration="1200" data-aos-delay={index * 150}>
                            <Link className={styles.popularCarGrid} href="#">
                                <div className={styles.popularCarGridTitle}>
                                    <h3>{type.title}</h3>
                                    <p>{type.count}</p>
                                </div>
                                <div className={styles.popularCarGridImg}>
                                    <Image 
                                        src={type.image} 
                                        alt={type.title} 
                                        title={type.title}
                                        width={236} 
                                        height={250} 
                                        className="img-fluid"
                                        style={{ width: 'auto', height: 'auto' }}
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
