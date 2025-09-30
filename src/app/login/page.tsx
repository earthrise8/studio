'use client';
import { useActionState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { login } from '@/lib/actions';
import { auth, signInWithEmailAndPassword } from '@/lib/firebase';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
        </Button>
    )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'idToken';
      hiddenInput.value = idToken;
      formRef.current?.appendChild(hiddenInput);

      // Programmatically submit the form to trigger the server action
      formRef.current?.requestSubmit();

    } catch (error: any) {
        let errorMessage = 'An unknown error occurred.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        }
        // To display the error, we can manually trigger the form action with an error state
        const errorFormData = new FormData();
        errorFormData.append('error', errorMessage);
        formAction(errorFormData);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="w-full max-w-sm">
        <div className='flex justify-center mb-6'>
            <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 font-headline">Welcome Back</h1>
        <p className="text-center text-muted-foreground mb-6">Sign in to access your dashboard.</p>
        
        <Card>
            <CardContent className='pt-6'>
                 <form
                    ref={formRef}
                    action={formAction}
                    onSubmit={handleFormSubmit}
                    className="space-y-4"
                >
                    {state?.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Authentication Failed</AlertTitle>
                            <AlertDescription>
                                {state.error}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
        
         <p className="px-8 text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
      </div>
    </div>
  );
}
