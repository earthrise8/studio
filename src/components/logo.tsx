
import { cn } from '@/lib/utils';

export default function Logo({ className, hideTextOnCollapse = false }: { className?: string, hideTextOnCollapse?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center space-x-2 text-2xl font-bold font-headline transition-all group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:text-xl',
        className
      )}
    >
      <div className="flex items-center justify-center h-11 w-11 transition-all group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
        <svg
            width="44"
            height="44"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#00FFC2', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path
                d="M85,10H40C26.19,10,15,21.19,15,35V80C15,88.28,21.72,95,30,95H40V85H30C27.24,85,25,82.76,25,80V35C25,26.72,31.72,20,40,20H85V10Z"
                fill="url(#logoGradient)"
            />
            <path
                d="M50 45H70V55H50z"
                fill="url(#logoGradient)"
            />
        </svg>
      </div>
      <span className={cn(hideTextOnCollapse && 'group-data-[collapsible=icon]:hidden')}>Fitropolis</span>
    </div>
  );
}
