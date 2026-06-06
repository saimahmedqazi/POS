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
    'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20',

  secondary:
    'bg-surface border border-border hover:bg-surface-hover text-foreground',

  danger:
    'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20',

  success:
    'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20',
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
      className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}