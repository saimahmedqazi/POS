import { useEffect } from 'react';
import { X } from 'lucide-react';

export type ToastVariant = 'success' | 'error';

type Props = {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, variant = 'error', onClose, duration = 3000 }: Props) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const styles = variant === 'error' 
    ? 'border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400'
    : 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400';

  return (
    <div className={`fixed top-12 right-4 z-[9999] w-full max-w-md rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-5 fade-in duration-300 ${styles}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="hover:opacity-70 transition-opacity flex items-center justify-center">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
