import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

const providers = []

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Always add credentials provider
providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email) {
        return null
      }

      let user = await prisma.user.findUnique({
        where: { email: credentials.email as string }
      })

      if (!user) {
        // Create new user for demo (in production, use proper registration)
        user = await prisma.user.create({
          data: {
            email: credentials.email as string,
            name: credentials.email.split("@")[0],
            skills: "[]"
          }
        })
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  })
)

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Check if user exists, if not create them
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || profile?.name || user.email?.split("@")[0],
              image: user.image || profile?.picture,
              skills: "[]",
              emailVerified: new Date()
            }
          })
        } else {
          // Update user info if needed
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              emailVerified: existingUser.emailVerified || new Date()
            }
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      
      // If signing in with Google, fetch user from database
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        if (dbUser) {
          token.id = dbUser.id
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})

