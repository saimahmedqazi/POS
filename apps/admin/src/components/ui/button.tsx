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
    'bg-slate-900 hover:bg-slate-800 text-white',

  secondary:
    'bg-white border hover:bg-slate-50 text-slate-900',

  danger:
    'bg-red-500 hover:bg-red-600 text-white',

  success:
    'bg-green-600 hover:bg-green-700 text-white',
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