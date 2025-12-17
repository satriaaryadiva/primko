interface Props {
  title: string;
  children: React.ReactNode;
}

export default function DashboardSection({ title, children }: Props) {
  return (
    <section className="bg-white rounded-2xl border p-6 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
