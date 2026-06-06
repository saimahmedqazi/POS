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
      <h1 className="text-3xl font-bold text-foreground">
        {title}
      </h1>

      {subtitle && (
        <p className="text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}