import { NextResponse, type NextRequest } from 'next/server';

import { CommonResponseFactory } from '@/app/lib/network';
import { env } from '@/app/config/env';
import { getToken } from 'next-auth/jwt';

import jwt from 'jsonwebtoken';

import allowedUsersJSON from '@/app/config/allowed-users.json';

export const config = {
  matcher: '/api/:path*',
};

export async function middleware(request: NextRequest) {
  const isAuthRequired = !!env.API_TOKEN;

  if (!isAuthRequired) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: env.AUTH_SECRET! });

  const decoded = jwt.decode(token.access_token);

  const isRecognized = (unique_name: string) => {
    return allowedUsersJSON.allowedUsers.includes(unique_name);
  }

  const unprotectedRoutes = ['/api/ping', '/api/auth/', '/api/serve/', '/api/static/'];

  const isUnprotected = unprotectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isUnprotected) {
    return NextResponse.next();
  }


  if (!isRecognized(decoded?.unique_name)) {
    return CommonResponseFactory.buildUnauthorizedResponse();
  }
}
