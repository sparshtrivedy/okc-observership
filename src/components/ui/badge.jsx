import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-transparent bg-slate-100 text-slate-800',
      success: 'border-transparent bg-emerald-100 text-emerald-700',
      warning: 'border-transparent bg-amber-100 text-amber-700',
      info: 'border-transparent bg-blue-100 text-blue-700',
      danger: 'border-transparent bg-red-100 text-red-700'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
