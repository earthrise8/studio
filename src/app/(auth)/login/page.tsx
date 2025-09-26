import { AuthForm } from '@/components/auth-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Welcome Back
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AuthForm type="login" />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary/90 hover:text-primary">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
