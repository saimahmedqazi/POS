import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

type Variant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success';

type Props = {
  children: ReactNode;

  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variants = {
  primary:
    'bg-accent hover:bg-blue-400 text-white shadow-lg shadow-accent/20 border border-accent/50',

  secondary:
    'bg-surface hover:bg-surface-hover border border-border text-foreground',

  danger:
    'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 shadow-lg shadow-red-500/5',

  success:
    'bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5',
};

export default function Button({
  children,

  variant = 'primary',

  className = '',

  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`px-4 py-3 rounded-2xl font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}