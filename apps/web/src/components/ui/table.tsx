import type {
  ReactNode,
} from 'react';

type Props = {
  children: ReactNode;
};

export function Table({
  children,
}: Props) {
  return (
    <div className="bg-surface/90 backdrop-blur-sm border border-border shadow-sm rounded-3xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
}: Props) {
  return (
    <thead className="bg-surface-hover/50 text-muted-foreground font-medium text-sm">
      {children}
    </thead>
  );
}

export function TableBody({
  children,
}: Props) {
  return (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
}: Props) {
  return (
    <tr className="hover:bg-surface-hover/50 transition-colors duration-200">
      {children}
    </tr>
  );
}

export function TableCell({
  children,
}: Props) {
  return (
    <td className="p-4 text-foreground">
      {children}
    </td>
  );
}