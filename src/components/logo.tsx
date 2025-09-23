import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 font-headline text-lg font-semibold', className)}>
      <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Download className="size-5" />
      </div>
      <span className="min-w-max">TODOC OTA</span>
    </div>
  );
}
