
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
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            rx="20"
            ry="20"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fontSize="110"
            fontWeight="bold"
            fontFamily="sans-serif"
            fill="hsl(var(--primary))"
          >
            F
          </text>
        </svg>
      </div>
      <span className={cn(hideTextOnCollapse && 'group-data-[collapsible=icon]:hidden')}>Fitropolis</span>
    </div>
  );
}
