import { getPageBySlug } from '@/lib/wordpress';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);

    if (!page) {
        return {
            title: 'Page Not Found',
        };
    }

    return {
        title: `${page.title.rendered} | Auto Buyers Guide`,
        description: page.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 160) || `Read ${page.title.rendered}`,
    };
}

export default async function DynamicPage(props: PageProps) {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);

    if (!page) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <article className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 
                        className="text-4xl font-bold text-gray-800 mb-4"
                        dangerouslySetInnerHTML={{ __html: page.title.rendered }} 
                    />
                </header>

                {/* Featured Image */}
                {page._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                    <div className="mb-8 h-96 w-full overflow-hidden rounded-lg shadow-lg">
                        <img 
                            src={page._embedded['wp:featuredmedia'][0].source_url} 
                            alt={page.title.rendered}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div 
                    className="prose prose-lg max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-700"
                    dangerouslySetInnerHTML={{ __html: page.content.rendered }} 
                />
            </article>
        </div>
    );
}
