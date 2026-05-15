type Props = {
  title: string;

  value: string | number;
};

export default function StatCard({
  title,

  value,
}: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition p-6">
      <p className="text-slate-500 text-sm font-medium">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-3 text-slate-900">
        {value}
      </h2>
    </div>
  );
}