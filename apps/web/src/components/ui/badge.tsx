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
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',

  danger:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

  warning:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',

  neutral:
    'bg-muted text-muted-foreground',
};

export default function Badge({
  children,

  variant = 'neutral',
}: Props) {
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-bold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}