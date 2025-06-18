import { Hono } from 'hono'
import type { Env } from '../types/env'

const content = new Hono<{ Bindings: Env }>()

// 模拟数据存储
const posts = [
  { 
    id: 1, 
    title: 'Sample Post', 
    content: 'This is a sample post', 
    category: 'general',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// 获取所有内容
content.get('/posts', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const offset = (page - 1) * limit
    
    if (c.env?.DB) {
      // 从数据库获取
      const results = await c.env.DB.prepare(`
        SELECT * FROM posts 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all()
      
      const total = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM posts
      `).first()
      
      return c.json({
        success: true,
        data: {
          posts: results.results,
          pagination: {
            page,
            limit,
            total: total.count,
            pages: Math.ceil(total.count / limit)
          }
        }
      })
    }
    
    // 使用模拟数据
    const startIndex = offset
    const endIndex = offset + limit
    const paginatedPosts = posts.slice(startIndex, endIndex)
    
    return c.json({
      success: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: posts.length,
          pages: Math.ceil(posts.length / limit)
        }
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch posts'
    }, 500)
  }
})

// 获取单个内容
content.get('/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (c.env?.DB) {
      const post = await c.env.DB.prepare(`
        SELECT * FROM posts WHERE id = ?
      `).bind(id).first()
      
      if (!post) {
        return c.json({
          success: false,
          error: 'Post not found'
        }, 404)
      }
      
      return c.json({
        success: true,
        data: post
      })
    }
    
    // 使用模拟数据
    const post = posts.find(p => p.id === id)
    
    if (!post) {
      return c.json({
        success: false,
        error: 'Post not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: post
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch post'
    }, 500)
  }
})

// 创建新内容
content.post('/posts', async (c) => {
  try {
    const { title, content: postContent, category, tags } = await c.req.json()
    
    if (!title || !postContent) {
      return c.json({
        success: false,
        error: 'Title and content are required'
      }, 400)
    }
    
    const newPost = {
      id: Date.now(),
      title,
      content: postContent,
      category: category || 'general',
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (c.env?.DB) {
      const result = await c.env.DB.prepare(`
        INSERT INTO posts (title, content, category, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        title, 
        postContent, 
        newPost.category, 
        JSON.stringify(newPost.tags),
        newPost.createdAt,
        newPost.updatedAt
      ).run()
      
      newPost.id = result.meta.last_row_id
    } else {
      // 添加到模拟数据
      posts.unshift(newPost)
    }
    
    return c.json({
      success: true,
      data: newPost
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create post'
    }, 500)
  }
})

// 更新内容
content.put('/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const { title, content: postContent, category, tags } = await c.req.json()
    
    if (c.env?.DB) {
      const result = await c.env.DB.prepare(`
        UPDATE posts 
        SET title = ?, content = ?, category = ?, tags = ?, updated_at = ?
        WHERE id = ?
      `).bind(
        title, 
        postContent, 
        category, 
        JSON.stringify(tags),
        new Date().toISOString(),
        id
      ).run()
      
      if (result.changes === 0) {
        return c.json({
          success: false,
          error: 'Post not found'
        }, 404)
      }
      
      const updatedPost = await c.env.DB.prepare(`
        SELECT * FROM posts WHERE id = ?
      `).bind(id).first()
      
      return c.json({
        success: true,
        data: updatedPost
      })
    }
    
    // 使用模拟数据
    const postIndex = posts.findIndex(p => p.id === id)
    
    if (postIndex === -1) {
      return c.json({
        success: false,
        error: 'Post not found'
      }, 404)
    }
    
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content: postContent,
      category,
      tags,
      updatedAt: new Date().toISOString()
    }
    
    return c.json({
      success: true,
      data: posts[postIndex]
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update post'
    }, 500)
  }
})

// 删除内容
content.delete('/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (c.env?.DB) {
      const result = await c.env.DB.prepare(`
        DELETE FROM posts WHERE id = ?
      `).bind(id).run()
      
      if (result.changes === 0) {
        return c.json({
          success: false,
          error: 'Post not found'
        }, 404)
      }
    } else {
      // 使用模拟数据
      const postIndex = posts.findIndex(p => p.id === id)
      
      if (postIndex === -1) {
        return c.json({
          success: false,
          error: 'Post not found'
        }, 404)
      }
      
      posts.splice(postIndex, 1)
    }
    
    return c.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete post'
    }, 500)
  }
})

// 搜索内容
content.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || ''
    const category = c.req.query('category')
    
    if (!query) {
      return c.json({
        success: false,
        error: 'Search query is required'
      }, 400)
    }
    
    if (c.env?.DB) {
      let sql = `SELECT * FROM posts WHERE (title LIKE ? OR content LIKE ?)`
      const params = [`%${query}%`, `%${query}%`]
      
      if (category) {
        sql += ` AND category = ?`
        params.push(category)
      }
      
      sql += ` ORDER BY created_at DESC`
      
      const results = await c.env.DB.prepare(sql).bind(...params).all()
      
      return c.json({
        success: true,
        data: results.results
      })
    }
    
    // 使用模拟数据
    let filteredPosts = posts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase())
    )
    
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category)
    }
    
    return c.json({
      success: true,
      data: filteredPosts
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Search failed'
    }, 500)
  }
})

export { content as contentRoutes } 