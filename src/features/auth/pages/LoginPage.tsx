import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, School, Shield, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../auth-context";

/* ---------------------------------------------
   Schema & Types
---------------------------------------------- */
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type ResetFormValues = z.infer<typeof resetSchema>;

/* ---------------------------------------------
   Utils
---------------------------------------------- */
const resolveRedirect = (state: unknown) => {
  if (state && typeof state === "object" && "from" in state) {
    const fromState = (state as { from?: { pathname?: string } }).from;
    if (fromState?.pathname) return fromState.pathname;
  }
  return "/dashboard";
};

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ---------------------------------------------
   Dark Modal (no external dialog dep)
---------------------------------------------- */
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-slate-800 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-300" />
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6 text-slate-200 text-lg">{children}</div>
      </div>
    </div>
  );
};

/* ---------------------------------------------
   Dark Checkbox (local)
---------------------------------------------- */
const Checkbox: React.FC<{
  id: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}> = ({ id, checked = false, onChange }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-indigo-400 focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
};

/* ---------------------------------------------
   Login Page — Dark + Big Fonts
---------------------------------------------- */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // state
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // forms
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: useMemo<LoginFormValues>(() => ({ email: "", password: "", remember: false }), []),
    mode: "onBlur",
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  // redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolveRedirect(location.state), { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  // caps lock detection
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState("CapsLock")) setCapsLockOn(true);
  };
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!e.getModifierState("CapsLock")) setCapsLockOn(false);
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password, { remember: rememberMe });
      navigate(resolveRedirect(location.state), { replace: true });
    } catch {
      setError("root", { message: "Invalid email or password. Please check your credentials and try again." });
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-2xl space-y-10">
        {/* header */}
        <div className="text-center">
          <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-2xl shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <School className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">School Management</h1>
          <p className="mt-3 text-slate-300 text-xl">Welcome back! Please sign in to continue</p>
        </div>

        {/* card */}
        <Card className="w-full bg-slate-800 border border-slate-700 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-3xl font-bold text-white">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
              {/* email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-200 text-lg font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className="pl-12 pr-4 py-4 text-lg bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-600 focus:border-indigo-400"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-base text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* password */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-200 text-lg font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-base font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pl-12 pr-12 py-4 text-lg bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-600 focus:border-indigo-400"
                    {...register("password")}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
                {capsLockOn && (
                  <p className="text-base text-amber-300 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Caps Lock is on
                  </p>
                )}
                {errors.password && (
                  <p className="text-base text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* remember */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox id="remember" checked={rememberMe} onChange={setRememberMe} />
                  <Label htmlFor="remember" className="text-slate-200 text-lg cursor-pointer">
                    Remember me
                  </Label>
                </div>
              </div>

              {/* root errors */}
              {errors.root && (
                <div className="rounded-lg border border-rose-800 bg-rose-950/40 text-rose-200 p-4">
                  <p className="text-base flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {errors.root.message as string}
                  </p>
                </div>
              )}

              {/* submit */}
              <Button
                className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* footer */}
        <div className="text-center">
          <p className="text-slate-400 text-base">
            © {new Date().getFullYear()} School Management System. All rights reserved.
          </p>
        </div>
      </div>

      {/* forgot password modal */}
      <Modal open={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} title="Reset Your Password">
        <form
          className="space-y-4"
          onSubmit={resetForm.handleSubmit(async (v) => {
            setIsResetting(true);
            try {
              await new Promise((r) => setTimeout(r, 1200)); // replace with API
              alert(`If an account exists with ${v.email}, you will receive a password reset link.`);
              setIsForgotPasswordOpen(false);
              resetForm.reset();
            } finally {
              setIsResetting(false);
            }
          })}
        >
          <p className="text-slate-300 text-base">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-slate-200 text-lg">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              className="py-4 text-lg bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-600 focus:border-indigo-400"
              {...resetForm.register("email")}
            />
            {resetForm.formState.errors.email && (
              <p className="text-base text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {resetForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-slate-100 border-slate-600 hover:bg-slate-700"
              onClick={() => setIsForgotPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              disabled={isResetting}
            >
              {isResetting ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
