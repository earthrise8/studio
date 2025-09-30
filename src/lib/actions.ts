'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import {
  createUser as createDbUser,
  getUser,
} from './data';
import type { User } from './types';
import { redirect } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from './firebase-admin';

// In a real app, you'd use a library like Lucia or Firebase Admin for session management.
const lucia = {
    createSession: (userId: string, attributes: object) => ({ id: `session_${userId}_${Date.now()}` }),
    createSessionCookie: (sessionId: string) => ({ name: 'auth_session', value: sessionId, attributes: { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30 } })
}

async function createSession(uid: string) {
    const session = await lucia.createSession(uid, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}


const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.'}),
  idToken: z.string(), // From Firebase client
  clientError: z.string().optional(),
});

export async function signup(prevState: { error: string } | null, formData: FormData) {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        const error = parsed.error.errors[0].message;
        return { error };
    }

    // If a client-side error occurred, show it to the user
    if (parsed.data.clientError) {
        return { error: parsed.data.clientError };
    }

    await initializeFirebaseAdmin();
    
    const { name, email, idToken } = parsed.data;

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        let existingUser = await getUser(uid);
        if (existingUser) {
            return { error: 'User already exists.' };
        }
        
        await createDbUser({
            id: uid,
            email: email,
            name: name,
            profile: {
                dailyCalorieGoal: 2000,
                healthGoal: 'Get started',
                avatarUrl: `https://i.pravatar.cc/150?u=${uid}` // Placeholder avatar
            }
        });

        await createSession(uid);

    } catch (e: any) {
        console.error('Signup Error:', e);
        if(e.code === 'auth/id-token-expired') {
            return { error: 'Signup session expired. Please try again.' };
        }
        return { error: e.message || 'An unknown error occurred during signup.' };
    }
    
    redirect('/dashboard');
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  idToken: z.string(), // From Firebase client
  clientError: z.string().optional(),
});

export async function login(prevState: { error: string } | null, formData: FormData) {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));

     if (!parsed.success) {
        const error = parsed.error.errors[0].message;
        return { error };
    }
    
    if (parsed.data.clientError) {
        return { error: parsed.data.clientError };
    }
    
    await initializeFirebaseAdmin();
    const { idToken } = parsed.data;

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        await createSession(uid);
    } catch(e: any) {
        console.error('Login error', e);
        if (e.code === 'auth/id-token-expired') {
             return { error: 'Login session expired. Please try again.' };
        }
        return { error: 'Invalid email or password.' };
    }
    
    redirect('/dashboard');
}


export async function getCurrentUser(): Promise<User | null> {
    const sessionId = cookies().get('auth_session')?.value ?? null;
    if (!sessionId) {
        return null;
    }
    // In this mock, we extract the userId from the fake session id
    const userId = sessionId.split('_')[1];
    if (!userId) return null;
    const user = await getUser(userId);
    return user;
}

export async function logout() {
    cookies().delete('auth_session');
    redirect('/login');
}
