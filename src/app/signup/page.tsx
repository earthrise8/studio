'use client';
import { useActionState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInWithGoogle } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';

function GoogleIcon() {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
        <path d="M1 1h22v22H1z" fill="none" />
      </svg>
    );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signInWithGoogle, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        if (formRef.current) {
            const idTokenInput = formRef.current.querySelector('input[name="idToken"]') as HTMLInputElement;
            if (idTokenInput) {
                idTokenInput.value = idToken;
            }
            formRef.current.requestSubmit();
        }
    } catch (error: any) {
        console.error("Google sign in error", error);
        if (formRef.current) {
             const errorInput = document.createElement('input');
             errorInput.type = 'hidden';
             errorInput.name = 'error';
             errorInput.value = 'Failed to sign up with Google. Please try again.';
             formRef.current.appendChild(errorInput);
             formRef.current.requestSubmit();
        }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
         <div className='flex justify-center mb-6'>
            <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 font-headline">Create an Account</h1>
        <p className="text-center text-muted-foreground mb-6">Join Fitropolis by signing up with your Google account.</p>
        
        <Card>
            <CardContent className='pt-6'>
                 <form action={formAction} ref={formRef}>
                    <input type="hidden" name="idToken" value="" />
                     {state?.error && (
                        <Alert variant="destructive" className='mb-4'>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Authentication Failed</AlertTitle>
                            <AlertDescription>
                                {state.error}
                            </AlertDescription>
                        </Alert>
                    )}
                    <Button type="button" className="w-full gap-2" onClick={handleGoogleSignIn} disabled={pending}>
                        {pending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <GoogleIcon />
                        )}
                        Sign Up with Google
                    </Button>
                </form>
            </CardContent>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Log In
            </Link>
          </p>
      </div>
    </div>
  );
}
