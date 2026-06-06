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
      className={`bg-surface/60 backdrop-blur-md border border-border rounded-2xl shadow-2xl shadow-black/20 p-6 ${className}`}
    >
      {children}
    </div>
  );
}