'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardBody, CardFooter, CardHeader, Input, Spinner } from '@nextui-org/react';
import { getProviders, signIn, useSession } from 'next-auth/react';

import { title } from '@/app/components/primitives';

export default function LoginForm() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  const target = searchParams.get('callbackUrl') ?? '/';
  const callbackUrl = decodeURI(target);

  useEffect(() => {
    // redirect if already authenticated
    if (session.status === 'authenticated') {
      router.replace(callbackUrl);
    }

  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await signIn('credentials', {
      apiToken: input,
      redirect: false,
    });

    result?.error ? setError('invalid API key') : router.replace(callbackUrl);
  };

  return session.status === 'loading' ? (
    <Spinner />
  ) : (
    <div className="grid col-span-6 justify-center">
      <h1 className={title()}>Login</h1>
      <Card className="h-screen min-w-[340px] max-h-[250px] p-2 mt-10">
        <CardHeader className="content-start max-h-14">
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="min-w-full h-24">
            <button onClick={() => signIn('azure-ad', { callbackUrl })}>
              Sign in with Azure AD
            </button>
          </CardBody>
          <CardFooter className="mt-5">
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}