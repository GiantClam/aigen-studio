// 测试 Vertex AI 集成的简单脚本
// 运行: node test-vertex-ai.js

async function testVertexAI() {
  const testImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  
  try {
    console.log('🧪 Testing Vertex AI integration...');
    
    // 测试图像编辑接口
    const editResponse = await fetch('http://localhost:8787/api/ai/image/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: testImageData,
        instruction: 'Make this image brighter and more colorful',
        model: 'gemini-2.5-flash-image-preview'
      })
    });
    
    const editResult = await editResponse.json();
    if (editResult.success) {
      console.log('✅ Image Edit API Response:', {
        success: editResult.success,
        provider: editResult.data?.provider,
        model: editResult.data?.model,
        hasEditedImage: !!editResult.data?.editedImageUrl,
        textResponse: editResult.data?.textResponse?.substring(0, 100) + '...'
      });
    } else {
      console.log('❌ Image Edit API Error:', editResult.error);
    }
    
    // 测试图像分析接口
    const analyzeResponse = await fetch('http://localhost:8787/api/ai/image/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: testImageData,
        prompt: 'Describe this image'
      })
    });
    
    const analyzeResult = await analyzeResponse.json();
    if (analyzeResult.success) {
      console.log('✅ Image Analysis API Response:', {
        success: analyzeResult.success,
        provider: analyzeResult.data?.provider,
        hasAnalysis: !!analyzeResult.data?.analysis
      });
    } else {
      console.log('❌ Image Analysis API Error:', analyzeResult.error);
    }
    
    // 测试图像生成接口
    const generateResponse = await fetch('http://localhost:8787/api/ai/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
        model: 'gemini-2.5-flash-image-preview'
      })
    });
    
    const generateResult = await generateResponse.json();
    if (generateResult.success) {
      console.log('✅ Image Generation API Response:', {
        success: generateResult.success,
        provider: generateResult.data?.provider,
        model: generateResult.data?.model,
        hasGeneratedImage: !!generateResult.data?.imageUrl
      });
    } else {
      console.log('❌ Image Generation API Error:', generateResult.error);
    }
    
    console.log('\n🎉 All tests completed!');

    // 总结
    const allSuccessful = editResult.success && analyzeResult.success && generateResult.success;
    const isVertexAIWorking =
      editResult.data?.provider === 'vertex-ai' ||
      analyzeResult.data?.provider === 'vertex-ai' ||
      generateResult.data?.provider === 'vertex-ai';

    if (allSuccessful && isVertexAIWorking) {
      console.log('🚀 Vertex AI is working correctly!');
    } else if (!allSuccessful) {
      console.log('❌ Some tests failed. Vertex AI may not be configured properly.');
      console.log('   To enable Vertex AI:');
      console.log('   1. Set GOOGLE_CLOUD_PROJECT environment variable');
      console.log('   2. Set GOOGLE_SERVICE_ACCOUNT_KEY environment variable');
      console.log('   3. Ensure the service account has Vertex AI permissions');
    } else {
      console.log('⚠️  Tests passed but not using Vertex AI. Check configuration.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// 运行测试
testVertexAI();
