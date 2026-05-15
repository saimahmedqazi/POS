import type {
  ReactNode,
} from 'react';

type Variant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral';

type Props = {
  children: ReactNode;

  variant?: Variant;
};

const variants = {
  success:
    'bg-green-100 text-green-700',

  danger:
    'bg-red-100 text-red-700',

  warning:
    'bg-yellow-100 text-yellow-700',

  neutral:
    'bg-slate-100 text-slate-700',
};

export default function Badge({
  children,

  variant = 'neutral',
}: Props) {
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wide font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}