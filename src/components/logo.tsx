
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Logo({ className, hideTextOnCollapse = false }: { className?: string, hideTextOnCollapse?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center space-x-2 text-2xl font-bold font-headline transition-all group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:text-xl',
        className
      )}
    >
      <div className="flex items-center justify-center h-11 w-11 transition-all group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
        <Image
            src="/logo.png"
            alt="Fitropolis Logo"
            width={44}
            height={44}
            className="transition-all"
        />
      </div>
      <span className={cn(hideTextOnCollapse && 'group-data-[collapsible=icon]:hidden')}>Fitropolis</span>
    </div>
  );
}
