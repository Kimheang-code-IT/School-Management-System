import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '../auth-context';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const resolveRedirect = (state: unknown) => {
  if (state && typeof state === 'object' && 'from' in state) {
    const fromState = (state as { from?: { pathname?: string } }).from;
    if (fromState?.pathname) {
      return fromState.pathname;
    }
  }
  return '/dashboard';
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@school.io', password: 'password123' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolveRedirect(location.state), { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      navigate(resolveRedirect(location.state), { replace: true });
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Unable to login' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800/80 bg-slate-900/80 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-100">System Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
              {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
            </div>
            {errors.root && <p className="text-sm text-rose-400">{errors.root.message}</p>}
            <Button className="w-full" type="submit" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
