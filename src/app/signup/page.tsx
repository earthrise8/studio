'use client';
import { useActionState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { signup } from '@/lib/actions';
import { auth, createUserWithEmailAndPassword } from '@/lib/firebase';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
        </Button>
    )
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, null);
  const formRef = useRef<HTMLFormElement>(null);
  const idTokenRef = useRef<HTMLInputElement>(null);
  
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Create user with Firebase client SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      
      if(idTokenRef.current) {
        idTokenRef.current.value = idToken;
      }

      // Programmatically submit the form to trigger the server action
      formRef.current?.requestSubmit();

    } catch (error: any) {
        const errorFormData = new FormData(formRef.current!);
        let errorMessage = 'An unknown error occurred.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please log in.';
        }
        errorFormData.set('idToken', 'error'); // send bad token
        errorFormData.set('clientError', errorMessage);
        formAction(errorFormData);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
         <div className='flex justify-center mb-6'>
            <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 font-headline">Create an Account</h1>
        <p className="text-center text-muted-foreground mb-6">Enter your details below to create your account.</p>
        
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
                            <AlertTitle>Signup Failed</AlertTitle>
                            <AlertDescription>
                                {state.error}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <input type="hidden" name="idToken" ref={idTokenRef} />
                    <SubmitButton />
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
