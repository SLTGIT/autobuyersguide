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
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">WordPress API Diagnostics</h1>

      {/* API URL */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">API Configuration</h2>
        <p className="text-sm text-gray-600 mb-2">API URL:</p>
        <code className="bg-gray-800 text-white p-2 rounded block mt-1 overflow-x-auto text-sm">
          {apiUrl}
        </code>
      </div>

      {/* Posts Test */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          Posts Test
          <span className={`ml-3 text-sm ${diagnostics.posts.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.posts.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.posts.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Error:</p>
            <code>{diagnostics.posts.error}</code>
          </div>
        )}
        {diagnostics.posts.data && (
          <div>
            <p className="text-gray-500 mb-2">Found {(diagnostics.posts.data as any[]).length} posts:</p>
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
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          Pages Test
          <span className={`ml-3 text-sm ${diagnostics.pages.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.pages.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.pages.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Error:</p>
            <code>{diagnostics.pages.error}</code>
          </div>
        )}
        {diagnostics.pages.data && (
          <div>
            <p className="text-gray-500 mb-2">Found {(diagnostics.pages.data as any[]).length} pages:</p>
            <ul className="list-disc list-inside space-y-1">
              {(diagnostics.pages.data as any[]).map((page: any) => (
                <li key={page.id} className="text-gray-700">
                  {page.title.rendered} - Slug: <code className="bg-gray-100 px-1 rounded">{page.slug}</code> (ID: {page.id})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Settings Test */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          Site Settings Test
          <span className={`ml-3 text-sm ${diagnostics.settings.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.settings.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.settings.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Error:</p>
            <code>{diagnostics.settings.error}</code>
          </div>
        )}
        {diagnostics.settings.data && (
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong className="font-semibold">Site Title:</strong> {(diagnostics.settings.data as any).title}
            </p>
            <p className="text-gray-700">
              <strong className="font-semibold">Description:</strong> {(diagnostics.settings.data as any).description}
            </p>
          </div>
        )}
      </div>

      {/* Menu Test */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          Menu Test (Primary)
          <span className={`ml-3 text-sm ${diagnostics.menu.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {diagnostics.menu.status === 'success' ? '✓ Success' : '✗ Failed'}
          </span>
        </h2>
        {diagnostics.menu.error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-semibold">Note:</p>
            <code>{diagnostics.menu.error}</code>
            <p className="text-sm mt-2 text-yellow-700">
              This is expected if you haven't installed the WP REST API Menus plugin yet.
            </p>
          </div>
        )}
        {diagnostics.menu.data && (
          <div>
            <p className="text-gray-500 mb-2">Menu items found:</p>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-xs text-gray-800">
              {JSON.stringify(diagnostics.menu.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-green-800">
        <h2 className="text-xl font-semibold mb-4">✓ Next Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>If you see errors above, check your <code>.env</code> file</li>
          <li>Make sure WordPress is running at the configured URL</li>
          <li>Verify CORS is enabled in WordPress</li>
          <li>Install WP REST API Menus plugin for menu support</li>
          <li>After fixing issues, refresh this page</li>
        </ol>
      </div>
    </div>
  );
}
