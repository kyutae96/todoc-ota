
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // This will be adapted later
  const { login } = useAuth();
  const { toast } = useToast();

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({
        title: 'Access Request Submitted',
        description: "Your request has been sent for approval. You will be notified via email when you have access.",
    });
    // In a real scenario, you'd call a function here to save the user's request.
    // For now, we'll just show the toast and clear the form.
    setTimeout(() => {
        setIsLoading(false);
        setEmail('');
        setName('');
        setOrganization('');
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Flame className="size-8" />
                </div>
            </div>
          <CardTitle className="text-2xl font-headline">Request Access</CardTitle>
          <CardDescription>
            Enter your details to request access to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleRequestAccess} className="grid gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-name">Name</Label>
              <Input
                id="login-name"
                type="text"
                placeholder="Your Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-organization">Organization</Label>
              <Input 
                id="login-organization" 
                type="text" 
                placeholder="Your Company"
                required 
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                disabled={isLoading}
                />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Access
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
