import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { getSiteSettings } from '@/lib/wordpress';
import HomeBanner from '@/components/home/HomeBanner';
import SearchForm from '@/components/home/SearchForm';
import CitySearchSlider from '@/components/home/CitySearchSlider';
import PopularCarTypes from '@/components/home/PopularCarTypes';
import PopularBrandsSlider from '@/components/home/PopularBrandsSlider';
import InfoBlocks from '@/components/home/InfoBlocks';

export async function generateMetadata(): Promise<Metadata> {
    const siteSettings = await getSiteSettings();
    return {
        title: siteSettings?.title || 'Home | Auto Buyers Guide',
        description: siteSettings?.description || 'A modern Next.js application powered by WordPress',
    };
}

export default async function Home() {
    // Note: Previous recentPosts fetch removed as it's not part of the new design.
    // Use getPosts if you need to display blog posts in the future.

    return (
        <main>
            <HomeBanner />
            {/* <SearchForm /> */}
            {/* <CitySearchSlider /> */}
            <PopularCarTypes />
            <PopularBrandsSlider />
            <InfoBlocks />
        </main>
    );
}
