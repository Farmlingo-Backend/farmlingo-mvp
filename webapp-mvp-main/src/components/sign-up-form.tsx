import { useAuth } from '@/providers/auth-provider';
import { Link, useNavigate } from 'react-router';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log('Sign up form submitted');
    if (signup) {
      signup();
      navigate('/virtual-farm');
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>Create a new account</h1>
        <p className='text-muted-foreground text-xs sm:text-sm text-balance'>
          Enter your details below to sign up
        </p>
      </div>
      <div className='grid gap-4 sm:gap-6'>
        <div className='grid gap-2 sm:gap-3'>
          <Label htmlFor='name' className='text-sm sm:text-base'>Full Name</Label>
          <Input id='name' type='text' placeholder='John Doe' required className='text-sm sm:text-base h-9 sm:h-10' />
        </div>
        <div className='grid gap-2 sm:gap-3'>
          <Label htmlFor='email' className='text-sm sm:text-base'>Email</Label>
          <Input id='email' type='email' placeholder='m@example.com' required className='text-sm sm:text-base h-9 sm:h-10' />
        </div>
        <div className='grid gap-2 sm:gap-3'>
          <Label htmlFor='password' className='text-sm sm:text-base'>Password</Label>
          <Input id='password' type='password' required className='text-sm sm:text-base h-9 sm:h-10' />
        </div>
        <div className='grid gap-2 sm:gap-3'>
          <Label htmlFor='confirmPassword' className='text-sm sm:text-base'>Confirm Password</Label>
          <Input id='confirmPassword' type='password' required className='text-sm sm:text-base h-9 sm:h-10' />
        </div>
        <Button type='submit' className='w-full h-9 sm:h-10 text-sm sm:text-base'>
          Sign Up
        </Button>
        <div className='after:border-border relative text-center text-xs sm:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
          <span className='bg-background text-muted-foreground relative z-10 px-2 text-xs sm:text-sm'>
            Or continue with
          </span>
        </div>
        <Button variant='outline' className='w-full h-9 sm:h-10 text-sm sm:text-base'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='2443'
            height='2500'
            preserveAspectRatio='xMidYMid'
            viewBox='0 0 256 262'
            id='google'
          >
            <path
              fill='#4285F4'
              d='M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027'
            ></path>
            <path
              fill='#34A853'
              d='M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1'
            ></path>
            <path
              fill='#FBBC05'
              d='M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782'
            ></path>
            <path
              fill='#EB4335'
              d='M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251'
            ></path>
          </svg>
          Login with Google
        </Button>
      </div>
      <div className='text-center text-xs sm:text-sm'>
        Already have an account?{' '}
        <Link to='/auth/login' className='underline underline-offset-4 hover:text-primary transition-colors'>
          Login
        </Link>
      </div>
    </form>
  );
}
