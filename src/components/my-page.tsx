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
import { updateUser, uploadAvatar } from '@/lib/api';
import { Loader2, Upload } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useState, useRef } from 'react';

const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  organization: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function MyPage() {
  const { user, UserAvatar, isLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(user.uid, file);
      await updateUser(user.uid, { avatar: avatarUrl });
      await refreshUser();
      toast({
        title: 'Avatar Updated',
        description: 'Your new avatar has been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was an error uploading your new avatar.',
      });
    } finally {
      setIsUploading(false);
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
            <div className="relative group">
                <UserAvatar className="size-20" />
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="size-6 text-white animate-spin" />
                    ) : (
                        <Upload className="size-6 text-white" />
                    )}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                />
            </div>
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
