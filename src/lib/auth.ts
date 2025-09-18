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
        // Upsert minimal user profile to Supabase `users` table
        const email = user.email || null
        const name = user.name || null
        const image = user.image || null
        const provider = account?.provider || null

        if (!supabaseServer) return true

        await supabaseServer.from('users').upsert(
          {
            email,
            name,
            avatar_url: image,
            provider
          },
          { onConflict: 'email' }
        )

        return true
      } catch (e) {
        console.error('Supabase upsert user failed:', e)
        return true // do not block sign-in
      }
    }
  }
}
 


