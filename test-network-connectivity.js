// 网络连接诊断工具
// 用于测试在网络受限环境下的Google服务连接
// 运行: node test-network-connectivity.js

const https = require('https');
const http = require('http');

// 测试的Google服务端点
const testEndpoints = [
  'https://www.google.com',
  'https://accounts.google.com',
  'https://oauth2.googleapis.com',
  'https://aiplatform.googleapis.com',
  'https://us-central1-aiplatform.googleapis.com'
];

// 代理配置（如果需要）
const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

async function testConnection(url, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log(`🔍 Testing connection to: ${url}`);
    
    if (proxyUrl) {
      console.log(`   Using proxy: ${proxyUrl}`);
    }

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: timeout,
      headers: {
        'User-Agent': 'Node.js Network Test'
      }
    };

    // 如果配置了代理，使用代理
    if (proxyUrl) {
      try {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        options.agent = new HttpsProxyAgent(proxyUrl);
      } catch (e) {
        console.log('   ⚠️  https-proxy-agent not installed, install with: npm install https-proxy-agent');
      }
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        success: true,
        status: res.statusCode,
        duration,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        success: false,
        error: error.message,
        duration
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        url,
        success: false,
        error: 'Connection timeout',
        duration
      });
    });

    req.end();
  });
}

async function testVertexAIAuth() {
  console.log('\n🔐 Testing Vertex AI Authentication...');
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!projectId || !serviceAccountKey) {
    console.log('❌ Missing environment variables:');
    console.log('   GOOGLE_CLOUD_PROJECT:', projectId ? '✅ Set' : '❌ Missing');
    console.log('   GOOGLE_SERVICE_ACCOUNT_KEY:', serviceAccountKey ? '✅ Set' : '❌ Missing');
    return false;
  }

  try {
    const credentials = JSON.parse(serviceAccountKey);
    console.log('✅ Service account key parsed successfully');
    console.log('   Project ID:', credentials.project_id);
    console.log('   Client Email:', credentials.client_email);
    
    // 测试OAuth端点
    const authResult = await testConnection('https://oauth2.googleapis.com/token');
    if (authResult.success) {
      console.log('✅ OAuth endpoint accessible');
    } else {
      console.log('❌ OAuth endpoint not accessible:', authResult.error);
    }
    
    return authResult.success;
  } catch (error) {
    console.log('❌ Invalid service account key:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting Network Connectivity Diagnostics...\n');
  
  // 检查代理配置
  if (proxyUrl) {
    console.log('🔧 Proxy Configuration:');
    console.log('   HTTP_PROXY:', process.env.HTTP_PROXY || 'Not set');
    console.log('   HTTPS_PROXY:', process.env.HTTPS_PROXY || 'Not set');
    console.log('');
  } else {
    console.log('ℹ️  No proxy configured (HTTP_PROXY/HTTPS_PROXY not set)\n');
  }

  // 测试基本连接
  console.log('🌐 Testing Basic Connectivity...');
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testConnection(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${endpoint} - ${result.status} (${result.duration}ms)`);
    } else {
      console.log(`❌ ${endpoint} - ${result.error} (${result.duration}ms)`);
    }
  }

  // 测试认证
  const authSuccess = await testVertexAIAuth();

  // 总结
  console.log('\n📊 Diagnostics Summary:');
  const successCount = results.filter(r => r.success).length;
  console.log(`   Connectivity: ${successCount}/${results.length} endpoints accessible`);
  console.log(`   Authentication: ${authSuccess ? '✅ Ready' : '❌ Issues detected'}`);
  
  if (successCount === 0) {
    console.log('\n🚨 No Google services accessible. Possible solutions:');
    console.log('   1. Check internet connection');
    console.log('   2. Configure VPN if in restricted network');
    console.log('   3. Set HTTP_PROXY/HTTPS_PROXY environment variables');
    console.log('   4. Install proxy agent: npm install https-proxy-agent');
    console.log('   5. Consider using cloud deployment instead of local testing');
  } else if (successCount < results.length) {
    console.log('\n⚠️  Partial connectivity detected. Some services may not work properly.');
  } else {
    console.log('\n🎉 All services accessible! Vertex AI should work properly.');
  }

  // 提供具体建议
  if (!authSuccess || successCount < results.length) {
    console.log('\n💡 Recommendations for restricted networks:');
    console.log('   • Deploy to cloud platform (Vercel, Railway, etc.)');
    console.log('   • Use cloud development environment (GitHub Codespaces, Gitpod)');
    console.log('   • Configure corporate proxy settings');
    console.log('   • Test with different VPN servers/protocols');
  }
}

// 运行诊断
runDiagnostics().catch(console.error);
