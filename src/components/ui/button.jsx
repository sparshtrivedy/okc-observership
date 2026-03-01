import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-clinical text-white shadow-sm hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md',
        outline: 'border border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm',
        ghost: 'text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100',
        danger: 'bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

Button.displayName = 'Button';

export { Button, buttonVariants };
