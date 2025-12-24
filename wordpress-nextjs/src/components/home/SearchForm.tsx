'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './SearchForm.module.scss';

export default function SearchForm() {
    const [activeTab, setActiveTab] = useState<'used' | 'new' | 'demo'>('used');

    return (
        <section className={styles['main-search-form']}>
            <div className="container-mid">
                <div className={styles['homeBanner-form']} data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                    
                    {/* Tabs Navigation */}
                    <ul className={`nav ${styles['nav-tabs']}`} role="tablist">
                        <li className={styles['nav-item']} role="presentation">
                            <button 
                                className={`${styles['nav-link']} ${activeTab === 'used' ? styles.active : ''}`} 
                                onClick={() => setActiveTab('used')}
                                type="button"
                            >
                                Used Cars
                            </button>
                        </li>
                        <li className={styles['nav-item']} role="presentation">
                            <button 
                                className={`${styles['nav-link']} ${activeTab === 'new' ? styles.active : ''}`} 
                                onClick={() => setActiveTab('new')}
                                type="button"
                            >
                                New Cars
                            </button>
                        </li>
                        <li className={styles['nav-item']} role="presentation">
                            <button 
                                className={`${styles['nav-link']} ${activeTab === 'demo' ? styles.active : ''}`} 
                                onClick={() => setActiveTab('demo')}
                                type="button"
                            >
                                Demo Cars
                            </button>
                        </li>
                    </ul>

                    {/* Tab Content */}
                    <div className={styles['tab-content']}>
                        
                        {/* Used Cars Tab */}
                        {activeTab === 'used' && (
                            <form className="d-flex align-items-center gap-3 w-100 flex-wrap flex-lg-nowrap">
                                <div className="d-flex flex-grow-1 gap-3 w-100">
                                    <div className={styles['form-group']}>
                                        <select className={`form-select ${styles['form-select']}`} aria-label="Select Make">
                                            <option defaultValue="">Any Make</option>
                                            <option value="Toyota">Toyota</option>
                                            <option value="Mazda">Mazda</option>
                                            <option value="Hyundai">Hyundai</option>
                                            <option value="Ford">Ford</option>
                                            <option value="Mitsubishi">Mitsubishi</option>
                                        </select>
                                    </div>
                                    <div className={styles['form-group']}>
                                        <select className={`form-select ${styles['form-select']}`} aria-label="Select Model">
                                            <option defaultValue="">Any Model</option>
                                            <option value="Corolla">Corolla</option>
                                            <option value="Camry">Camry</option>
                                            <option value="Hilux">Hilux</option>
                                            <option value="Ranger">Ranger</option>
                                            <option value="i30">i30</option>
                                        </select>
                                    </div>
                                    <div className={styles['form-group']}>
                                        <select className={`form-select ${styles['form-select']}`} aria-label="Body Type">
                                            <option defaultValue="">Body Type</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Ute">Ute</option>
                                            <option value="Sedan">Sedan</option>
                                            <option value="Hatchback">Hatchback</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className={`btn btn-danger ${styles['theme-btn']}`}>
                                    Search Used Cars
                                </button>
                            </form>
                        )}

                        {/* New Cars Tab */}
                        {activeTab === 'new' && (
                            <form className="d-flex align-items-center gap-3 w-100 flex-wrap flex-lg-nowrap">
                                <div className="d-flex flex-grow-1 gap-3 w-100">
                                    <div className={styles['form-group']}>
                                        <select className={`form-select ${styles['form-select']}`} aria-label="Select Make">
                                            <option defaultValue="">Any Make</option>
                                            <option value="Kia">Kia</option>
                                            <option value="MG">MG</option>
                                            <option value="Tesla">Tesla</option>
                                        </select>
                                    </div>
                                    <div className={styles['form-group']}>
                                         <select className={`form-select ${styles['form-select']}`} aria-label="Select Model">
                                            <option defaultValue="">Any Model</option>
                                            <option value="Sportage">Sportage</option>
                                            <option value="ZS">ZS</option>
                                            <option value="Model 3">Model 3</option>
                                        </select>
                                    </div>
                                     <div className={styles['form-group']}>
                                        <select className={`form-select ${styles['form-select']}`} aria-label="Body Type">
                                            <option defaultValue="">Body Type</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Ute">Ute</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className={`btn btn-danger ${styles['theme-btn']}`}>
                                    Search New Cars
                                </button>
                            </form>
                        )}

                        {/* Demo Cars Tab */}
                        {activeTab === 'demo' && (
                             <form className="d-flex align-items-center gap-3 w-100 flex-wrap flex-lg-nowrap">
                                <div className="d-flex flex-grow-1 gap-3 w-100">
                                     <div className={styles['form-group']}>
                                        <select className={`form-select ${styles['form-select']}`} aria-label="Select Make">
                                            <option defaultValue="">Any Make</option>
                                            <option value="Toyota">Toyota</option>
                                            <option value="Mitsubishi">Mitsubishi</option>
                                        </select>
                                    </div>
                                     <div className={styles['form-group']}>
                                         <select className={`form-select ${styles['form-select']}`} aria-label="Select Model">
                                            <option defaultValue="">Any Model</option>
                                            <option value="Corolla">Corolla</option>
                                            <option value="Triton">Triton</option>
                                        </select>
                                    </div>
                                     <div className={styles['form-group']}>
                                        <select className={`form-select ${styles['form-select']}`} aria-label="Body Type">
                                            <option defaultValue="">Body Type</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Ute">Ute</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className={`btn btn-danger ${styles['theme-btn']}`}>
                                    Search Demo Cars
                                </button>
                            </form>
                        )}

                        <div className="d-flex justify-content-end mt-2">
                             <Link href="/advanced-search" className={`${styles['arrow-cta']} small fw-bold`}>Advanced Search</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
