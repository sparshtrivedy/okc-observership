import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-40 bg-slate-900/50 data-[state=open]:animate-in data-[state=closed]:animate-out', className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = React.forwardRef(({ className, children, hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-[95%] max-w-xl -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
      {!hideClose ? (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('text-xl font-semibold text-slate-900', className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={cn('text-sm text-slate-600', className)} {...props} />;
}
