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
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Provide a valid email'),
  classLevel: z.string().min(2, 'Class/grade required'),
  guardianName: z.string().min(3, 'Guardian name required'),
  guardianContact: z.string().min(8, 'Contact number required'),
  startDate: z.string().min(1, 'Start date required'),
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
      email: '',
      classLevel: '',
      guardianName: '',
      guardianContact: '',
      startDate: '',
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

      <Callout>
        Submission currently stores mock data locally. API integration hooks are scaffolded to align with future
        admissions and CRM pipelines.
      </Callout>

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
              <Label htmlFor="email">Student email</Label>
              <Input id="email" type="email" placeholder="jane.doe@school.io" {...register('email')} />
              {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="classLevel">Class / Grade</Label>
              <Input id="classLevel" placeholder="Grade 9" {...register('classLevel')} />
              {errors.classLevel && <p className="text-sm text-rose-400">{errors.classLevel.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Intended start date</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-sm text-rose-400">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian name</Label>
              <Input id="guardianName" placeholder="Parent or guardian" {...register('guardianName')} />
              {errors.guardianName && <p className="text-sm text-rose-400">{errors.guardianName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian contact</Label>
              <Input id="guardianContact" placeholder="(+1) 555-123-4567" {...register('guardianContact')} />
              {errors.guardianContact && <p className="text-sm text-rose-400">{errors.guardianContact.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional context, accommodations, prior transcripts…" {...register('notes')} />
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
