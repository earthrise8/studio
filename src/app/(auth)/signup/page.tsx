import { AuthForm } from '@/components/auth-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Create an Account
        </CardTitle>
        <CardDescription>
          Start your journey with Fitropolis today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm type="signup" />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary/90 hover:text-primary">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
