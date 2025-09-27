'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import {
  createUser,
  getUser,
} from './data';
import type { User } from './types';
import { redirect } from 'next/navigation';

const lucia = {
    createSession: (userId: string, attributes: object) => ({ id: `session_${userId}_${Date.now()}` }),
    createSessionCookie: (sessionId: string) => ({ name: 'auth_session', value: sessionId, attributes: { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 } })
}

const loginSchema = z.object({
  accessCode: z.string().min(1, { message: 'Access Code is required' }),
});

export async function login(
  prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const { accessCode } = parsed.data;

  try {
    const existingUser = await getUser(accessCode);
    if (!existingUser) {
      return { error: 'Invalid Access Code' };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    return redirect('/dashboard');
  } catch (e: any) {
    if (e.message === 'NEXT_REDIRECT') {
        throw e;
    }
    return {
      error: e.message || 'An unknown error occurred',
    };
  }
}

const signupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});


export async function signup(
    prevState: { error: string, userId?: string } | null,
    formData: FormData
) {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return { error: parsed.error.errors.map((e) => e.message).join(', ') };
    }

    const { name } = parsed.data;

    try {
        const newUser = await createUser(name);

        const session = await lucia.createSession(newUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        return redirect(`/signup-success?code=${newUser.id}`);
    } catch(e: any) {
         if (e.message === 'NEXT_REDIRECT') {
            throw e;
        }
        return { error: e.message || 'An unknown error occurred' };
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const sessionId = cookies().get('auth_session')?.value ?? null;
    if (!sessionId) {
        return null;
    }
    // In a real app, you would validate the session with Lucia
    // For this mock, we'll extract the userId from the fake session id
    const userId = sessionId.split('_')[1];
    if (!userId) return null;
    const user = await getUser(userId);
    return user;
}

export async function logout() {
    // In a real app, you'd invalidate the session.
    // For this mock, just delete the cookie.
    cookies().delete('auth_session');
    redirect('/login');
}
