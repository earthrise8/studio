import { cn } from '@/lib/utils';

export default function Logo({ className, hideTextOnCollapse = false }: { className?: string, hideTextOnCollapse?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center space-x-2 text-2xl font-bold font-headline transition-all group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:text-xl',
        className
      )}
    >
      <div className="flex items-center justify-center h-8 w-8 transition-all group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
        <svg
            role="img"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            >
            <defs>
                <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#000', stopOpacity: 0.1}} />
                <stop offset="100%" style={{stopColor: '#000', stopOpacity: 0}} />
                </linearGradient>
            </defs>
            <path
                d="M50,10 C70,10 85,25 85,45 L85,90 L65,90 L65,55 C65,45 60,40 50,40 C40,40 35,45 35,55 L35,90 L15,90 L15,45 C15,25 30,10 50,10 Z"
                fill="hsl(var(--primary))"
            />
            <path
                d="M35,55 L65,55 L65,90 L35,90 L35,55 Z"
                fill="url(#shadowGradient)"
            />
            <path
                d="M20,42 C35,27 65,27 80,42 L75,50 C65,40 35,40 25,50 L20,42 Z"
                fill="hsl(var(--primary))"
            />
        </svg>
      </div>
      <span className={cn(hideTextOnCollapse && 'group-data-[collapsible=icon]:hidden')}>Fitropolis</span>
    </div>
  );
}
