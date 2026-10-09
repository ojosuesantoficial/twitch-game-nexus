import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

/** Shared demo modal: Escape, focus trapping and focus return are handled by Radix. */
export function DemoDialog({ open, onOpenChange, title, className = '', children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="modal-backdrop">
          <DialogPrimitive.Content className={`modal ${className}`} aria-describedby={undefined}>
            <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}