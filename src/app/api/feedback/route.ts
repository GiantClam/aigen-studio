import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthService } from '@/services/auth-service'
import { R2StorageService } from '@/lib/common-components'
import { Client as PGClient } from 'pg'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = (body?.message || '').toString()
    const email = body?.email ? String(body.email) : ''
    const context = body?.context ? String(body.context) : 'nanocanvas'
    const ua = request.headers.get('user-agent') || ''

    if (!message.trim()) {
      return NextResponse.json({ success: false, error: 'message is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const userEmail = session?.user?.email || email || null
    let userId: string | null = null
    if (userEmail) {
      try {
        const user = await AuthService.ensureUserByEmail(userEmail, session?.user?.name || undefined)
        userId = (user as any)?.id || null
      } catch {}
    }

    // Try Supabase DB insert first (service role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const { data, error } = await supabase
          .from('nanobanana_feedback')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            email: userEmail,
            message,
            context,
            user_agent: ua,
            created_at: new Date().toISOString()
          })
          .select('*')
          .single()
        if (!error) {
          return NextResponse.json({ success: true, data })
        }
        console.error('[feedback] supabase insert error:', error)
      } catch (e) {
        console.error('[feedback] supabase client error:', e)
      }
    }

    // Fallback: insert via Postgres direct connection if available
    const pgConn = process.env.POSTGRES_PRISMA_URL
    if (pgConn) {
      try {
        const pg = new PGClient({ connectionString: pgConn, ssl: { rejectUnauthorized: false } })
        await pg.connect()
        await pg.query(`
          create table if not exists public.nanobanana_feedback (
            id text primary key,
            user_id text,
            email text,
            message text not null,
            context text,
            user_agent text,
            created_at timestamptz not null default now()
          )
        `)
        const id = crypto.randomUUID()
        await pg.query(
          'insert into public.nanobanana_feedback (id, user_id, email, message, context, user_agent) values ($1,$2,$3,$4,$5,$6)',
          [id, userId, userEmail, message, context, ua]
        )
        await pg.end()
        return NextResponse.json({ success: true, data: { id } })
      } catch (e) {
        console.error('[feedback] pg insert error:', e)
      }
    }

    // Final fallback: store to R2 as JSON file
    try {
      const config = {
        accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL
      }
      if (config.accountId && config.accessKeyId && config.secretAccessKey && config.bucketName) {
        const r2 = new R2StorageService(config)
        const now = new Date()
        const day = now.toISOString().slice(0, 10)
        const fileName = `${day}-${now.getTime()}-${Math.random().toString(36).slice(2)}.json`
        const payload = Buffer.from(JSON.stringify({
          id: crypto.randomUUID(),
          user_id: userId,
          email: userEmail,
          message,
          context,
          user_agent: ua,
          created_at: now.toISOString()
        }))
        const saved = await r2.uploadFile(payload, fileName, 'feedback', 'application/json')
        return NextResponse.json({ success: true, data: { url: saved.url } })
      }
    } catch (e) {
      console.error('[feedback] r2 upload error:', e)
    }

    return NextResponse.json({ success: false, error: 'No storage configured' }, { status: 500 })
  } catch (error) {
    console.error('[feedback] error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

