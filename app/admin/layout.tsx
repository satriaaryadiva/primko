import BottomNavbar from "@/component/navigation/BottomNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
      <BottomNavbar role="admin" />
    </div>
  );
}