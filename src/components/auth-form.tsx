'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, signup } from '@/lib/actions';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

function SubmitButton({ type }: { type: 'login' | 'signup' }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {type === 'login' ? 'Log In' : 'Create Account'}
    </Button>
  );
}

export default function AuthForm({ type }: { type: 'login' | 'signup' }) {
  const action = type === 'login' ? login : signup;
  const [state, formAction] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.error === null) {
      // Use window.location for a full page refresh to ensure middleware runs
      window.location.href = '/dashboard';
    }
  }, [state, router]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {type === 'signup' && (
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Alex Doe"
                required
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder={type === 'login' ? '••••••••' : '6+ characters'} />
          </div>
          {state?.error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>
                    {state.error}
                </AlertDescription>
            </Alert>
          )}
          <SubmitButton type={type} />
        </form>
      </CardContent>
    </Card>
  );
}
