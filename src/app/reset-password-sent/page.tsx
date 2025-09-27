import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function ResetPasswordSentPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <MailCheck className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2 font-headline">Check Your Email</h1>
        <p className="text-muted-foreground mb-6">
          We've sent a (simulated) password reset link to your email address. Please check your inbox and follow the instructions.
        </p>
        <div className="space-y-4">
            <Button asChild className="w-full">
                <Link href="/reset-password">
                    Continue to Reset Password (Simulated)
                </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
                <Link href="/login">
                    Back to Login
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
