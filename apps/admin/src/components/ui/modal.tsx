import type {
  ReactNode,
} from 'react';

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}