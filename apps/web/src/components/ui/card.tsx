import type {
  ReactNode,
} from 'react';

type Props = {
  children: ReactNode;

  className?: string;
};

export default function Card({
  children,

  className = '',
}: Props) {
  return (
    <div
      className={`bg-surface/90 backdrop-blur-sm border border-border rounded-2xl shadow-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}