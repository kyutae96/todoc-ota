import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 font-headline text-lg font-semibold', className)}>
      <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Flame className="size-5" />
      </div>
      <span className="min-w-max">Firebase Inspector</span>
    </div>
  );
}
