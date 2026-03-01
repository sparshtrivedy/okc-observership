import React from 'react';
import { cn } from '../../lib/utils';

export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-slate-700', className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-[border-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
