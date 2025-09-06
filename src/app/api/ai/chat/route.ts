import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 })
    }

    // 简单的AI响应逻辑
    let response = ''

    if (context === 'image-editor') {
      // 图像编辑器相关的响应
      if (message.toLowerCase().includes('选择') || message.toLowerCase().includes('select')) {
        response = '要使用AI处理功能，请先选择画布中的对象（点击对象或拖拽框选），然后告诉我你想要如何处理它们。例如："让这个图形更亮一些"或"改变颜色为蓝色"。'
      } else if (message.toLowerCase().includes('工具') || message.toLowerCase().includes('tool')) {
        response = '左侧工具栏包含：选择工具（选择和移动对象）、移动工具（平移画布）、画笔工具（自由绘制）、矩形工具、圆形工具、文本工具，以及上传、删除、下载功能。'
      } else if (message.toLowerCase().includes('画布') || message.toLowerCase().includes('canvas')) {
        response = '这是一个无限画布，你可以：1) 滚轮缩放 2) Alt+拖拽或使用移动工具平移 3) 使用各种工具创建和编辑对象。选择对象后，我可以帮你用AI处理它们！'
      } else if (message.toLowerCase().includes('上传') || message.toLowerCase().includes('图片')) {
        response = '点击工具栏中的上传按钮可以添加图片到画布。上传后，你可以选择图片并告诉我如何处理，比如"让这张图片更明亮"或"去除背景"。'
      } else {
        response = `我理解你想要${message}。要使用AI图像处理功能，请：1) 选择画布中的对象 2) 告诉我你想要的效果。我会使用Vertex AI来处理选中的内容并在右侧显示结果。`
      }
    } else {
      // 通用响应
      response = `我理解你的问题："${message}"。我是一个AI图像编辑助手，可以帮你处理画布中的图像和对象。`
    }

    return NextResponse.json({
      success: true,
      data: {
        response,
        provider: 'simple-ai',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
