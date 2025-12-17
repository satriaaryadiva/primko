interface Props {
  label: string;
  value: string | number;
}

export default function SummaryItem({ label, value }: Props) {
  return (
    <div className="bg-white   rounded-xl border p-8">
      <p className="text-lg font-bold text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
