'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import {
  getUserByEmail,
  createUser,
  getUser,
} from './data';
import type { User } from './types';

const lucia = {
    // In a real app, this would be a proper Lucia instance.
    // For this mock, we just need a placeholder.
    createSession: (userId: string, attributes: object) => ({ id: `session_${userId}_${Date.now()}` }),
    createSessionCookie: (sessionId: string) => ({ name: 'auth_session', value: sessionId, attributes: { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 } })
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export async function login(
  prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const { email, password } = parsed.data;

  try {
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return { error: 'Incorrect email or password' };
    }

    // In a real app, you would verify the password hash
    // For this mock, we'll just check if the password is "password"
    if (password !== 'password') {
        return { error: 'Incorrect email or password' };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    return { error: null };
  } catch (e: any) {
    return {
      error: e.message || 'An unknown error occurred',
    };
  }
}

const signupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});


export async function signup(
    prevState: { error: string } | null,
    formData: FormData
) {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return { error: parsed.error.errors.map((e) => e.message).join(', ') };
    }

    const { name, email, password } = parsed.data;

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return { error: 'An account with this email already exists.' };
        }
        
        // In a real app, you would hash the password
        const newUser = await createUser(email, name, password);

        const session = await lucia.createSession(newUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        return { error: null };
    } catch(e: any) {
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
    const user = await getUser(userId);
    return user;
}

export async function logout() {
    // In a real app, you'd invalidate the session.
    // For this mock, just delete the cookie.
    cookies().delete('auth_session');
}
