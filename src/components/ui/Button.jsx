import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';


export function Button({
    className,
    variant = 'primary',
    size = 'default',
    isLoading,
    children,
    ...props
}) {
    const variants = {
        primary: 'bg-primary text-gray-900 font-bold hover:bg-primary-hover focus:ring-yellow-500',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
        outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
        link: 'bg-transparent text-primary hover:underline p-0 h-auto',
    };

    const sizes = {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
