import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 bg-[#F7F7F7]">
          {children}
        </main>
      </div>
    </div>
  );
}
