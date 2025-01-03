import NextAuth from 'next-auth';
import { NextAuthConfig } from 'next-auth';
import { type User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import AzureADProvider from "next-auth/providers/azure-ad";

const useAuth = !!process.env.API_TOKEN;

// strictly recommended to specify via env var
const secret = process.env.AUTH_SECRET ?? crypto.randomUUID();

// session expiration for api token auth
const expirationHours = process.env.UI_AUTH_EXPIRE_HOURS ? parseInt(process.env.UI_AUTH_EXPIRE_HOURS) : 2;
const expirationSeconds = expirationHours * 60 * 60;

export const authConfig: NextAuthConfig = {
  secret,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      authorization: { params: { redirect_uri: process.env.AZURE_AD_REDIRECT_URI } },
    }),
    CredentialsProvider({
      name: 'API Token',
      credentials: {
        apiToken: { label: 'API Token', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (credentials?.apiToken === process.env.API_TOKEN) {
          const token = jwt.sign({ authorized: true }, secret);

          return {
            apiToken: credentials.apiToken as string,
            jwtToken: token,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.apiToken = user.apiToken;
        token.jwtToken = user.jwtToken;
        token.access_token = account?.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.apiToken = token.apiToken as string;
      session.user.jwtToken = token.jwtToken as string;

      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: expirationSeconds,
  },
  trustHost: true,
  pages: {
    signIn: '/login',
  },
};

const getJwtStubToken = () => {
  return jwt.sign({ authorized: true }, secret);
};

const noAuth = {
  providers: [
    CredentialsProvider({
      name: 'No Auth',
      credentials: {},
      async authorize() {
        const token = getJwtStubToken();

        return { apiToken: token };
      },
    }),
  ],
  callbacks: {
    authorized: async () => {
      return true;
    },
    async session({ session }) {
      session.sessionToken = getJwtStubToken();
      session.user.jwtToken = session.sessionToken;

      return session;
    },
  },
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: expirationSeconds,
  },
  secret,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
