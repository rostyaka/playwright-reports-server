'use client';

import { useSession } from 'next-auth/react';

export const Greetings = () => {
    const { data: session } = useSession();
    return session?.user?.name && <h1>Hello, {session.user.name}!</h1>;
}