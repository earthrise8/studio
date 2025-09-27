import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import Link from 'next/link';
import { HardDriveDownload } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <HardDriveDownload className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2 font-headline">Access Codes</h1>
        <p className="text-muted-foreground mb-6">
            This app uses simple Access Codes instead of passwords. If you lose your code, the only way to recover your data is to sign up for a new account.
        </p>
        <div className="space-y-4">
            <Button asChild className="w-full">
                <Link href="/signup">
                    Create a New Account
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
