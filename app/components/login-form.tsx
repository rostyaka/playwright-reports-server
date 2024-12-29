'use client';

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract callback URL or fallback to the home page
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to the target URL if authenticated
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div>
        <h1>You are not signed in</h1>
        <button onClick={() => signIn('azure-ad', { callbackUrl })}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
    </div>
  );
}