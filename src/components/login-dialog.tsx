
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { FirebaseError } from 'firebase/app';

const emailPassSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});
export type EmailPassForm = z.infer<typeof emailPassSchema>;

const signUpSchema = emailPassSchema.extend({
    name: z.string().min(2, 'Please enter your name.'),
});
export type SignUpForm = z.infer<typeof signUpSchema>;

export function LoginDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'google' | 'email' | null>(null);

  const signInForm = useForm<EmailPassForm>({
    resolver: zodResolver(emailPassSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleFirebaseAuthError = (error: unknown) => {
    if (error instanceof FirebaseError) {
        switch(error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password.';
            case 'auth/email-already-in-use':
                return 'This email address is already in use.';
            case 'auth/weak-password':
                return 'The password is too weak.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    }
    return 'An unexpected error occurred. Please try again.';
  }

  const onSignInSubmit = async (data: EmailPassForm) => {
    setLoading('email');
    try {
      await signInWithEmail(data);
      toast({ title: "Welcome back!" });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: handleFirebaseAuthError(error),
      });
    } finally {
      setLoading(null);
    }
  };

  const onSignUpSubmit = async (data: SignUpForm) => {
    setLoading('email');
    try {
      await signUpWithEmail(data);
      toast({ title: 'Account Created!', description: "Welcome to Fitropolis!" });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: handleFirebaseAuthError(error),
      });
    } finally {
      setLoading(null);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      await signInWithGoogle();
      // The redirect will handle closing the dialog
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Google Sign In Failed',
        description: handleFirebaseAuthError(error),
      });
      setLoading(null);
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Fitropolis</DialogTitle>
          <DialogDescription>
            Sign in or create an account to save your progress.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="you@example.com" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="••••••••" type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={!!loading}>
                    {loading === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup">
             <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="you@example.com" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="••••••••" type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={!!loading}>
                    {loading === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={!!loading}>
            {loading === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Chrome className="mr-2 h-4 w-4" />
            )}
            Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
