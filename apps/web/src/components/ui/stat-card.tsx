type Props = {
  title: string;

  value: string | number;
};

export default function StatCard({
  title,

  value,
}: Props) {
  return (
    <div className="bg-surface text-foreground rounded-3xl border border-border shadow-sm hover:shadow-md transition p-6">
      <p className="text-muted-foreground text-sm font-medium">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-3 text-foreground">
        {value}
      </h2>
    </div>
  );
}