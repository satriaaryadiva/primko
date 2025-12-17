interface Props {
  title: string;
  value: string | number;
  loading?: boolean;
}

export default function StatCard({ title, value, loading }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>

      {loading ? (
        <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mt-2" />
      ) : (
        <p className="text-xl font-bold mt-1">{value}</p>
      )}
    </div>
  );
}
