'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import {
  createUser,
  getUser,
  updateUserProfile,
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

const googleSignInSchema = z.object({
  idToken: z.string(),
});

export async function signInWithGoogle(
  prevState: { error: string } | null,
  formData: FormData
) {
    await initializeFirebaseAdmin();
    const parsed = googleSignInSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return { error: 'Invalid request. Please try again.' };
    }

    const { idToken } = parsed.data;

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email || !name) {
            return { error: 'Google account is missing email or name.' };
        }

        let existingUser = await getUser(uid);

        if (!existingUser) {
            const newUser = await createUser({
                id: uid,
                email: email,
                name: name,
                profile: {
                    dailyCalorieGoal: 2000,
                    healthGoal: 'Get started',
                    avatarUrl: picture,
                }
            });
            existingUser = newUser;
        } else {
            // Update user's name and avatar from Google on login
             await updateUserProfile(uid, {
                name: name,
                email: email,
                profile: {
                    ...existingUser.profile,
                    avatarUrl: picture
                }
            });
        }
        
        // This session management is a placeholder.
        // In a real app, you'd use Firebase session cookies or another robust solution.
        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        
    } catch (e: any) {
        if (e.code === 'auth/id-token-expired') {
            return { error: 'Login session expired. Please try again.' };
        }
        console.error('Google Sign-In Error:', e);
        return { error: e.message || 'An unknown error occurred during Google Sign-In' };
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
