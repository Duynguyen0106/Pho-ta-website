interface AdminStatCardProps {
  label: string;
  value: string | number;
}

export function AdminStatCard({ label, value }: AdminStatCardProps) {
  return (
    <div className="luxury-card p-6">
      <p className="label-caps text-sm">{label}</p>
      <p className="mt-3 font-display text-4xl font-normal text-foreground">
        {value}
      </p>
    </div>
  );
}
