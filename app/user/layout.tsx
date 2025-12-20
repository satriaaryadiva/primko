import BottomNavbar from "@/component/navigation/BottomNavbar";


export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 ">
      {children}
      <BottomNavbar role="user" />
    </div>
  );
}