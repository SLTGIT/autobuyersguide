import Link from 'next/link';
import styles from './InfoBlocks.module.scss';

export default function InfoBlocks() {
    return (
        <section className={styles.twoBlockSection}>
            <div className="container-mid">
                <div className="row">
                    <div className="col-md-6 col-lg-6">
                        <div className={styles.twoBlockGrid}>
                            <div className={styles.content}>
                                <h2>Used Car Buying Guides & Expert Advice</h2>
                                <ul>
                                    <li>Best Used Cars to Buy in Australia ({new Date().getFullYear()})</li>
                                    <li>Most Reliable Used SUVs</li>
                                    <li>What to Check When Buying a Used Car from a Dealer</li>
                                    <li>PPSR Check Explained</li>
                                </ul>
                                <Link href="#" className={`${styles.ctaBtn} theme-btn white-btn mt-4`}>View All Guides</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-6">
                        <div className={`${styles.twoBlockGrid} ${styles.gridRed}`}>
                            <div className={styles.content}>
                                <h2>Grow Your Dealership with Auto Buyers Guide</h2>
                                <ul>
                                    <li>High-intent Australian car buyers</li>
                                    <li>Dealer-only marketplace</li>
                                    <li>Automotive data feed integrations</li>
                                    <li>Increased visibility in local search</li>
                                </ul>
                                <Link href="#" className={`${styles.ctaBtn} theme-btn white-btn mt-4`}>Become a Partner Dealer</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
