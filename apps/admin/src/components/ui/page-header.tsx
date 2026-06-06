type Props = {
  title: string;

  subtitle?: string;
};

export default function PageHeader({
  title,

  subtitle,
}: Props) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        {title}
      </h1>

      {subtitle && (
        <p className="text-slate-400 text-sm tracking-wider font-medium mt-1 uppercase">
          {subtitle}
        </p>
      )}
    </div>
  );
}