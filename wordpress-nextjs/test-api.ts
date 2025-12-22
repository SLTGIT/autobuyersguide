/**
 * WordPress API Test Script
 * 
 * This script tests all WordPress REST API endpoints to verify they're working.
 * Run this to diagnose API connection issues.
 */

const API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL || 'http://localhost/backend/wp-json/wp/v2';

async function testEndpoint(name: string, url: string) {
    try {
        console.log(`\n🔍 Testing ${name}...`);
        console.log(`   URL: ${url}`);
        
        const response = await fetch(url, {
            cache: 'no-store',
        });
        
        if (!response.ok) {
            console.log(`   ❌ FAILED: ${response.status} ${response.statusText}`);
            return false;
        }
        
        const data = await response.json();
        const dataLength = Array.isArray(data) ? data.length : 'N/A';
        console.log(`   ✅ SUCCESS: ${response.status} OK`);
        console.log(`   📊 Data: ${Array.isArray(data) ? `${dataLength} items` : 'Object'}`);
        
        if (Array.isArray(data) && data.length > 0) {
            console.log(`   📝 First item: ${data[0].title?.rendered || data[0].name || data[0].slug || 'Unknown'}`);
        } else if (!Array.isArray(data) && data.name) {
            console.log(`   📝 Site: ${data.name}`);
        }
        
        return true;
    } catch (error: any) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 WordPress REST API Connection Test');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n📍 Base URL: ${API_BASE}`);
    
    const results = {
        passed: 0,
        failed: 0,
    };
    
    // Test Root Endpoint (for site info)
    const rootUrl = API_BASE.replace('/wp/v2', '');
    if (await testEndpoint('Root Endpoint (Site Info)', rootUrl)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test Posts
    if (await testEndpoint('Posts', `${API_BASE}/posts?per_page=3`)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test Pages
    if (await testEndpoint('Pages', `${API_BASE}/pages?per_page=10`)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test Categories
    if (await testEndpoint('Categories', `${API_BASE}/categories`)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test Tags
    if (await testEndpoint('Tags', `${API_BASE}/tags`)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test Media
    if (await testEndpoint('Media', `${API_BASE}/media?per_page=5`)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test Users
    if (await testEndpoint('Users', `${API_BASE}/users`)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test Menus (optional - requires plugin)
    const menuUrl = API_BASE.replace('/wp/v2', '/menus/v1/locations/primary');
    if (await testEndpoint('Menu (Primary) - Optional', menuUrl)) {
        results.passed++;
    } else {
        console.log('   ℹ️  This is optional - requires WP REST API Menus plugin');
        // Don't count as failure
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 Test Results');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! WordPress API is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
        console.log('\n💡 Common fixes:');
        console.log('   1. Make sure WordPress is running');
        console.log('   2. Check your .env file has the correct URL');
        console.log('   3. Enable CORS in WordPress functions.php');
        console.log('   4. Verify WordPress REST API is enabled');
    }
    console.log('═══════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);

export {};
