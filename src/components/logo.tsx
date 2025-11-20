
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
          role="img"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          className='fill-primary'
        >
          <path d="M480.3,268.31c-101.89-32.2-224.5-11.2-288.2,79.5c-30.8,43.8-41.4,98-29.3,149.8c-0.7-0.1-1.3-0.1-2-0.2
	c-99.3-10-180-96-169.9-195.3c7.7-76,60.9-138.8,131.1-163.4c2.8-1,5.6-2,8.5-2.9c-2.3-44.2,18.1-88,57.4-113.4
	c2.5-1.6,5.2-3.1,7.9-4.5c0,0-10.3-20.5-10.3-20.5c-4.4-8.8-0.1-19.5,8.7-23.9c8.8-4.4,19.5-0.1,23.9,8.7l11.6,23.3
	c2-1.3,4-2.5,6-3.6c59.3-33,132.4-19.9,178.6,30.3c35.6,38.8,51,90.4,42.5,140.2c56,12.3,101.4,56.5,113.4,112.5
	C532.71,368.11,480.3,268.31,480.3,268.31z M204.3,113.31c-9.1,0-16.5,7.4-16.5,16.5s7.4,16.5,16.5,16.5s16.5-7.4,16.5-16.5
	S213.4,113.31,204.3,113.31z M204.3,162.81c-9.1,0-16.5,7.4-16.5,16.5s7.4,16.5,16.5,16.5s16.5-7.4,16.5-16.5
	S213.4,162.81,204.3,162.81z M347.8,206.51c-9.1,0-16.5,7.4-16.5,16.5s7.4,16.5,16.5,16.5s16.5-7.4,16.5-16.5
	S356.9,206.51,347.8,206.51z"/>
        </svg>
      </div>
      <span className={cn(hideTextOnCollapse && 'group-data-[collapsible=icon]:hidden')}>Fitropolis</span>
    </div>
  );
}
