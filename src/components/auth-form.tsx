'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, signup } from '@/lib/actions';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
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

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {type === 'signup' && (
            <div className="space-y-1">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Alex Doe"
                required
              />
            </div>
          )}
          {type === 'login' && (
            <div className="space-y-1">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                id="accessCode"
                name="accessCode"
                placeholder="fit-xxxxxx"
                required
                />
            </div>
          )}
          
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
