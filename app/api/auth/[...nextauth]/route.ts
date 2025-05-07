import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAuth } from "@/lib/firebase-admin";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        console.log("NextAuth authorize function called");
        
        if (!credentials?.idToken) {
          console.log("No idToken provided");
          return null;
        }

        try {
          console.log("Verifying Firebase token...");
          
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
          console.log("Token verified successfully for user:", decodedToken.uid);
          
          return {
            id: decodedToken.uid,
            name: decodedToken.name || decodedToken.email,
            email: decodedToken.email,
            image: decodedToken.picture,
          };
        } catch (error) {
          console.error("Firebase auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback called", { hasUser: !!user, tokenSub: token?.sub });
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called", { hasToken: !!token, sessionUser: !!session?.user });
      if (session?.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: true, // Enable debug mode for more detailed logs
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };