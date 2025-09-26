'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import {
  getUserByEmail,
  createUser,
  getUser,
} from './data';
import type { User } from './types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    const validatedFields = loginSchema.safeParse(values);
    if (!validatedFields.success) {
      return { success: false, error: 'Invalid fields!' };
    }

    const { email } = validatedFields.data;

    // In a real app, you'd verify the password hash. Here we just find the user.
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return { success: false, error: 'Invalid credentials!' };
    }

    // Set a cookie to simulate session
    cookies().set('session_userId', existingUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Something went wrong.' };
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  try {
    const validatedFields = signupSchema.safeParse(values);
    if (!validatedFields.success) {
      return { success: false, error: 'Invalid fields!' };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'Email already in use!' };
    }

    const newUser = await createUser(email, email.split('@')[0]);

    // Set a cookie to simulate session
    cookies().set('session_userId', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Something went wrong.' };
  }
}

export async function logout() {
  cookies().delete('session_userId');
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = cookies().get('session_userId')?.value;
  if (!userId) {
    // For demo purposes, return a default user if not logged in.
    // In a real app, you'd return null.
    return getUser('user1');
  }
  const user = await getUser(userId);
  return user;
}
