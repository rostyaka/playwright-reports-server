import { NextRequest } from "next/server";
import { env } from '@/app/config/env';
import allowedUsersJSON from '@/app/config/allowed-users.json';

export const isAuthorized = ({
  actualAuthToken,
  expectedAuthToken,
}: {
  actualAuthToken: string | null;
  expectedAuthToken: string;
}) => actualAuthToken === expectedAuthToken;

export const isAllowedServerCommunication = (request: NextRequest): boolean => {
  const isTokenCorrect = request.headers.get("x-api-key") === env.API_TOKEN;
  const isPlaywright = request.headers.get("User-Agent")?.includes("playwright") ?? false

  const allowedRoutes = ['/api/result/upload', 'api/config'];

  const isAllowedRoute = allowedRoutes.some((route) => request.nextUrl.pathname.includes(route));

  return isTokenCorrect && isPlaywright && isAllowedRoute;
}

export const isRecognizedOrganization = (unique_name: string) => {
  if (!unique_name?.includes('@')) {
    return false
  }

  const domain = unique_name.slice(unique_name.indexOf('@') + 1)
  return allowedUsersJSON.allowedDomains.includes(domain);
}