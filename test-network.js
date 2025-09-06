// 网络连接测试脚本
// 运行: node test-network.js

const https = require('https');
const http = require('http');

async function testNetworkConnectivity() {
  console.log('🌐 Testing network connectivity...\n');

  // 测试基本网络连接
  const testUrls = [
    'https://www.google.com',
    'https://googleapis.com',
    'https://aiplatform.googleapis.com',
    'https://us-central1-aiplatform.googleapis.com'
  ];

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const startTime = Date.now();
      
      await new Promise((resolve, reject) => {
        const request = https.get(url, { timeout: 10000 }, (response) => {
          const duration = Date.now() - startTime;
          console.log(`✅ ${url} - Status: ${response.statusCode} - Time: ${duration}ms`);
          resolve(response);
        });
        
        request.on('error', (error) => {
          console.log(`❌ ${url} - Error: ${error.message}`);
          reject(error);
        });
        
        request.on('timeout', () => {
          console.log(`⏰ ${url} - Timeout (10s)`);
          request.destroy();
          reject(new Error('Timeout'));
        });
      });
    } catch (error) {
      // 错误已经在上面处理了
    }
  }

  console.log('\n📋 Environment Variables:');
  console.log(`HTTP_PROXY: ${process.env.HTTP_PROXY || 'Not set'}`);
  console.log(`HTTPS_PROXY: ${process.env.HTTPS_PROXY || 'Not set'}`);
  console.log(`NO_PROXY: ${process.env.NO_PROXY || 'Not set'}`);

  console.log('\n🔧 Proxy Detection:');
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    console.log('✅ Proxy environment variables detected');
  } else {
    console.log('❌ No proxy environment variables found');
    console.log('   If you need to use a proxy, set:');
    console.log('   export HTTP_PROXY=http://your-proxy:port');
    console.log('   export HTTPS_PROXY=http://your-proxy:port');
  }

  console.log('\n🌍 DNS Resolution Test:');
  const dns = require('dns');
  const domains = ['googleapis.com', 'aiplatform.googleapis.com'];
  
  for (const domain of domains) {
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve4(domain, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      console.log(`✅ ${domain} resolves to: ${addresses.join(', ')}`);
    } catch (error) {
      console.log(`❌ ${domain} DNS resolution failed: ${error.message}`);
    }
  }

  console.log('\n🔍 System Information:');
  console.log(`Node.js version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. If you\'re in China or behind a firewall:');
  console.log('   - Set up a proxy server (HTTP_PROXY/HTTPS_PROXY)');
  console.log('   - Use a VPN that supports system-wide proxy');
  console.log('   - Consider using a proxy service like clash, v2ray, etc.');
  
  console.log('\n2. For corporate networks:');
  console.log('   - Contact IT for proxy settings');
  console.log('   - Check if googleapis.com is whitelisted');
  
  console.log('\n3. Alternative solutions:');
  console.log('   - Use a cloud server (AWS, GCP, Azure) to run the application');
  console.log('   - Deploy to Vercel/Netlify (they have direct access)');
  console.log('   - Use a different AI service (OpenAI, Anthropic, etc.)');
}

// 运行测试
testNetworkConnectivity().catch(console.error);
