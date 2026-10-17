import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { RegisterCard } from '@/components/RegisterCard';

export function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-espresso-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md animate-[fadeIn_0.15s_ease-out] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-espresso-700 text-cream-50 shadow-md transition hover:bg-espresso-900"
          >
            <X size={18} />
          </button>
          <RegisterCard onDone={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
