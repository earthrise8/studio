'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import {
  getUserByEmail,
  createUser,
  getUser,
} from './data';
import type { User } from './types';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from './firebase';


export async function getCurrentUser(): Promise<User | null> {
  // Always return the default user since there is no login.
  const user = await getUser('user1');
  return user;
}
