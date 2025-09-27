import AuthForm from '@/components/auth-form';
import Logo from '@/components/logo';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
         <div className='flex justify-center mb-6'>
            <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 font-headline">Create an Account</h1>
        <p className="text-center text-muted-foreground mb-6">Enter your information to create a new account.</p>
        <AuthForm type="signup" />
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
