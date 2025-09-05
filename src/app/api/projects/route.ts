import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ImageProcessor } from '@/lib/image-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { title, description, imageData, canvasData, isPublic } = await request.json()

    if (!title || !imageData) {
      return NextResponse.json({ error: 'Title and image data are required' }, { status: 400 })
    }

    // 压缩图像数据
    const compressedImageData = await ImageProcessor.compressLargeImage(imageData, 5)
    
    // 生成缩略图
    const thumbnail = await ImageProcessor.generateThumbnail(compressedImageData, 200)

    const project = await prisma.project.create({
      data: {
        title,
        description,
        imageData: compressedImageData,
        canvasData,
        thumbnail,
        isPublic: isPublic || false,
        userId: user.id
      }
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
