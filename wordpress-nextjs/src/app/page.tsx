import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { getSiteSettings } from '@/lib/wordpress';
import HomeBanner from '@/components/home/HomeBanner';
import PopularCarTypes from '@/components/home/PopularCarTypes';
import PopularBrandsSlider from '@/components/home/PopularBrandsSlider';
import InfoBlocks from '@/components/home/InfoBlocks';
import LatestBlogPosts from '@/components/home/LatestBlogPosts';
import PopularUsedCars from '@/components/home/PopularUsedCars';
import VisitUs from '@/components/home/VisitUs';

export async function generateMetadata(): Promise<Metadata> {
    const siteSettings = await getSiteSettings();
    return {
        // title: siteSettings?.title || 'Home | Statewide Auto Group',
        title: 'Statewide Auto Group',
        description: siteSettings?.description || 'Statewide Auto Group is a leading provider of used cars in Australia. We offer a wide range of used cars for sale in Australia.',
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
            {/* <PopularBrandsSlider /> */}
            <PopularUsedCars />
            <LatestBlogPosts />
            {/* <InfoBlocks /> */}
            <VisitUs />
        </main>
    );
}
