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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
}: Props) {
  return (
    <thead className="bg-slate-50">
      {children}
    </thead>
  );
}

export function TableBody({
  children,
}: Props) {
  return (
    <tbody>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
}: Props) {
  return (
    <tr className="border-t hover:bg-slate-50 transition">
      {children}
    </tr>
  );
}

export function TableCell({
  children,
}: Props) {
  return (
    <td className="p-4 text-slate-700">
      {children}
    </td>
  );
}