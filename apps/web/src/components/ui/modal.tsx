import type {
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;

  title: string;

  children: ReactNode;

  onClose: () => void;
};

export default function Modal({
  open,

  title,

  children,

  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/95 backdrop-blur-lg border border-border text-foreground rounded-3xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-muted-foreground hover:text-foreground transition-colors"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}