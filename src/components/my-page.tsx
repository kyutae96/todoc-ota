'use client';

import { useAuth } from '@/contexts/auth-context';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  organization: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function MyPage() {
  const { user, UserAvatar, isLoading, refreshUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      organization: user?.organization || '',
    },
    values: { // ensures form is re-populated when user data loads
        name: user?.name || '',
        organization: user?.organization || '',
    }
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) return;
    try {
      await updateUser(user.uid, data);
      await refreshUser(); // Re-fetch user data to update UI
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update your profile.',
      });
    }
  };
  
  if (isLoading || !user) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>My Page</CardTitle>
            <CardDescription>View and manage your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="size-20 rounded-full" />
                <div className='space-y-2'>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>My Page</CardTitle>
        <CardDescription>View and manage your profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <UserAvatar className="size-20" />
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.organization}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="Your organization (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
