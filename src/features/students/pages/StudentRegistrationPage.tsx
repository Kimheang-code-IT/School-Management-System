import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

const registrationSchema = z.object({
  fullName: z.string().min(3, 'Student name must be at least 3 characters'),
  sex: z.string().min(1, 'Select a sex option'),
  email: z.string().email('Provide a valid email'),
  phone: z.string().min(8, 'Phone number required'),
  classLevel: z.string().min(2, 'Class is required'),
  session: z.string().min(1, 'Session is required'),
  location: z.string().min(2, 'Location is required'),
  notes: z.string().max(500).optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const StudentRegistrationPage = () => {
  const [submitted, setSubmitted] = useState<RegistrationFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      sex: '',
      email: '',
      phone: '',
      classLevel: '',
      session: '',
      location: '',
      notes: '',
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmitted(values);
    reset();
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Student Registration"
        description="Capture enrollment requests with validation and guardrails."
      />

      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Enrollment Form</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Student name</Label>
              <Input id="fullName" placeholder="Jane Doe" {...register('fullName')} />
              {errors.fullName && <p className="text-sm text-rose-400">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <select
                id="sex"
                {...register('sex')}
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
                defaultValue=""
              >
                <option value="" disabled>
                  Select sex
                </option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              {errors.sex && <p className="text-sm text-rose-400">{errors.sex.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jane.doe@school.io" {...register('email')} />
              {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" placeholder="(+1) 555-0101" {...register('phone')} />
              {errors.phone && <p className="text-sm text-rose-400">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="classLevel">Class</Label>
              <Input id="classLevel" placeholder="Grade 9" {...register('classLevel')} />
              {errors.classLevel && <p className="text-sm text-rose-400">{errors.classLevel.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <select
                id="session"
                {...register('session')}
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
                defaultValue=""
              >
                <option value="" disabled>
                  Select session
                </option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
              {errors.session && <p className="text-sm text-rose-400">{errors.session.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Provide location" {...register('location')} />
              {errors.location && <p className="text-sm text-rose-400">{errors.location.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional context, accommodations, or onboarding details."
                {...register('notes')}
              />
              {errors.notes && <p className="text-sm text-rose-400">{errors.notes.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-xs text-slate-500">All data is validated client-side via Zod.</p>
            <Button type="submit" isLoading={isSubmitting}>
              Submit registration
            </Button>
          </CardFooter>
        </form>
      </Card>

      {submitted && (
        <Card className="border-slate-800/80 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Submission Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950/60 p-4 text-xs text-slate-300">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentRegistrationPage;
