'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AOSInit() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.matchMedia("(max-width: 991.98px)").matches;

    if (prefersReducedMotion || isMobile) {
      return;
    }

    AOS.init({
      once: true,
      easing: "ease-out-cubic",
      duration: 1000,
      offset: 50,
    });
  }, []);

  return null;
}
