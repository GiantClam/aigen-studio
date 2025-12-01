import { type NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseServer } from '@/lib/supabase-server'

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider
      }
      if (profile && typeof profile === 'object') {
        const name = (profile as Record<string, unknown>).name
        if (typeof name === 'string' && !token.name) token.name = name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as Record<string, unknown>).provider = (token as Record<string, unknown>).provider
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        const email = user.email || null
        const name = user.name || null

        if (!supabaseServer || !email) return true

        const { data: existing, error: qErr } = await supabaseServer
          .from('nanobanana_users')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (qErr) {
          console.warn('Query nanobanana_users failed', qErr)
        }

        if (!existing) {
          const { error: insErr } = await supabaseServer
            .from('nanobanana_users')
            .insert({ email, name, role: 'user' })
          if (insErr) {
            console.error('Insert nanobanana_users failed', insErr)
          }
        } else if (name) {
          const { error: updErr } = await supabaseServer
            .from('nanobanana_users')
            .update({ name })
            .eq('id', existing.id)
          if (updErr) {
            console.warn('Update nanobanana_users name failed', updErr)
          }
        }

        return true
      } catch (e) {
        console.error('Supabase user sync failed:', e)
        return true
      }
    }
  }
}
 
