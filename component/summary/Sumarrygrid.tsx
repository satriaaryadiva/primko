import SummaryItem from "./Sumaryitems";


interface Summary {
  totalUsers: number;
  totalCorps: number;
  totalCash: number;
  todayTopup: number;
}

interface Props {
  data: Summary;
}

export default function SummaryGrid({ data }: Props) {
  return (
    <div className="flex flex-col item-center  text-center mx-16 md:grid-cols-4 gap-4">
       <SummaryItem
        label="Total Cash"
        value={`Rp ${data.totalCash.toLocaleString()}`}
      />
      <div className=" w-full hidden sm:flex justify-between flex-row gap-4">
      <SummaryItem label="Total User" value={data.totalUsers} />
      <SummaryItem label="Total Corps" value={data.totalCorps} />
     </div>
     
    </div>
  );
}
