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
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <g clipPath="url(#clip0)">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill="currentColor"
            />
            <path
              d="M13.5 10.5C14.33 10.5 15 9.83 15 9C15 8.17 14.33 7.5 13.5 7.5C12.67 7.5 12 8.17 12 9C12 9.83 12.67 10.5 13.5 10.5Z"
              fill="currentColor"
            />
            <path
              d="M10.5 13.5C11.33 13.5 12 12.83 12 12C12 11.17 11.33 10.5 10.5 10.5C9.67 10.5 9 11.17 9 12C9 12.83 9.67 13.5 10.5 13.5Z"
              fill="currentColor"
            />
            <path
              d="M13 15.5H11V17.5H13V15.5Z"
              fill="currentColor"
            />
            <path
              d="M13 13.5H11V15.5H13V13.5Z"
              fill="currentColor"
            />
             <path
              d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12ZM15 12C15 10.35 13.65 9 12 9C10.35 9 9 10.35 9 12C9 13.65 10.35 15 12 15C13.65 15 15 13.65 15 12Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <span className={cn(hideTextOnCollapse && 'group-data-[collapsible=icon]:hidden')}>Fitropolis</span>
    </div>
  );
}
