import { getPosts, getPages, getSiteSettings, getMenuByLocation } from '@/lib/wordpress';

export default async function DiagnosticPage() {
  const diagnostics = {
    posts: { status: 'checking...', data: null as any, error: null as string | null },
    pages: { status: 'checking...', data: null as any, error: null as string | null },
    settings: { status: 'checking...', data: null as any, error: null as string | null },
    menu: { status: 'checking...', data: null as any, error: null as string | null },
  };

  // Test Posts
  try {
    const posts = await getPosts({ per_page: 3 });
    diagnostics.posts.status = 'success';
    diagnostics.posts.data = posts;
  } catch (error: any) {
    diagnostics.posts.status = 'error';
    diagnostics.posts.error = error.message;
  }

  // Test Pages
  try {
    const pages = await getPages({ per_page: 10 });
    diagnostics.pages.status = 'success';
    diagnostics.pages.data = pages;
  } catch (error: any) {
    diagnostics.pages.status = 'error';
    diagnostics.pages.error = error.message;
  }

  // Test Settings
  try {
    const settings = await getSiteSettings();
    diagnostics.settings.status = 'success';
    diagnostics.settings.data = settings;
  } catch (error: any) {
    diagnostics.settings.status = 'error';
    diagnostics.settings.error = error.message;
  }

  // Test Menu
  try {
    const menu = await getMenuByLocation('primary');
    diagnostics.menu.status = 'success';
    diagnostics.menu.data = menu;
  } catch (error: any) {
    diagnostics.menu.status = 'error';
    diagnostics.menu.error = error.message;
  }

  const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL || 'NOT SET';

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">WordPress API Diagnostics</h1>

      {/* API URL */}
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-bold mb-2 text-gray-800">API Configuration</h2>
        <p className="text-sm text-gray-600 mb-2">API URL:</p>
        <code className="block p-3 bg-gray-800 text-white rounded text-sm break-all">
          {apiUrl}
        </code>
      </div>

      {/* Posts Test */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Posts Test
          <span className={`ml-3 text-sm ${diagnostics.posts.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.posts.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.posts.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-semibold">Error:</p>
            <code className="text-sm text-red-600">{diagnostics.posts.error}</code>
          </div>
        )}
        {diagnostics.posts.data && (
          <div>
            <p className="text-gray-600 mb-2">Found {(diagnostics.posts.data as any[]).length} posts:</p>
            <ul className="list-disc list-inside space-y-1">
              {(diagnostics.posts.data as any[]).map((post: any) => (
                <li key={post.id} className="text-gray-700">
                  {post.title.rendered} (ID: {post.id})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pages Test */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Pages Test
          <span className={`ml-3 text-sm ${diagnostics.pages.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.pages.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.pages.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-semibold">Error:</p>
            <code className="text-sm text-red-600">{diagnostics.pages.error}</code>
          </div>
        )}
        {diagnostics.pages.data && (
          <div>
            <p className="text-gray-600 mb-2">Found {(diagnostics.pages.data as any[]).length} pages:</p>
            <ul className="list-disc list-inside space-y-1">
              {(diagnostics.pages.data as any[]).map((page: any) => (
                <li key={page.id} className="text-gray-700">
                  {page.title.rendered} - Slug: <code className="bg-gray-100 px-2 py-1 rounded">{page.slug}</code> (ID: {page.id})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Settings Test */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Site Settings Test
          <span className={`ml-3 text-sm ${diagnostics.settings.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.settings.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.settings.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-semibold">Error:</p>
            <code className="text-sm text-red-600">{diagnostics.settings.error}</code>
          </div>
        )}
        {diagnostics.settings.data && (
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Site Title:</strong> {(diagnostics.settings.data as any).title}
            </p>
            <p className="text-gray-700">
              <strong>Description:</strong> {(diagnostics.settings.data as any).description}
            </p>
          </div>
        )}
      </div>

      {/* Menu Test */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Menu Test (Primary)
          <span className={`ml-3 text-sm ${diagnostics.menu.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.menu.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.menu.error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 font-semibold">Note:</p>
            <code className="text-sm text-yellow-600">{diagnostics.menu.error}</code>
            <p className="text-sm text-yellow-700 mt-2">
              This is expected if you haven't installed the WP REST API Menus plugin yet.
            </p>
          </div>
        )}
        {diagnostics.menu.data && (
          <div>
            <p className="text-gray-600 mb-2">Menu items found:</p>
            <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(diagnostics.menu.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-xl font-bold mb-3 text-gray-800">✓ Next Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>If you see errors above, check your <code className="bg-gray-200 px-2 py-1 rounded">.env</code> file</li>
          <li>Make sure WordPress is running at the configured URL</li>
          <li>Verify CORS is enabled in WordPress</li>
          <li>Install WP REST API Menus plugin for menu support</li>
          <li>After fixing issues, refresh this page</li>
        </ol>
      </div>
    </div>
  );
}
