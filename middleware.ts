import { NextResponse, type NextRequest } from 'next/server';

import { CommonResponseFactory } from '@/app/lib/network';
import { env } from '@/app/config/env';
import { getToken } from 'next-auth/jwt';

import jwt from 'jsonwebtoken';

import allowedUsersJSON from '@/app/config/allowed-users.json';

import { isAuthorized } from '@/app/lib/auth';

export const config = {
  matcher: '/api/:path*',
};

export async function middleware(request: NextRequest) {
  const isAuthRequired = !!env.API_TOKEN;

  if (!isAuthRequired) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: env.AUTH_SECRET!,
    secureCookie: !!env.NEXTAUTH_URL?.includes('https')
  });

  interface CustomJwtPayload extends jwt.JwtPayload {
    unique_name: string;
  }

  const decoded = jwt.decode(token?.access_token as string) as CustomJwtPayload;

  const isRecognizedOrganization = (unique_name: string) => {
    const domain = unique_name.slice(unique_name.indexOf('@') + 1)
    return allowedUsersJSON.allowedDomains.includes(domain);
  }

  const unprotectedRoutes = ['/api/ping', '/api/auth/', '/api/serve/', '/api/static/'];

  const isUnprotected = unprotectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isUnprotected) {
    return NextResponse.next();
  }

  const actualAuthToken = request.headers.get('Authorization');
  const expectedAuthToken = env.API_TOKEN!;

  if (!isAuthorized({ actualAuthToken, expectedAuthToken }) && !isRecognizedOrganization(decoded?.unique_name)) {
    return CommonResponseFactory.buildUnauthorizedResponse();
  }
}
