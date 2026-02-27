"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItem = (href: string, label: string) => (
    <Link href={href}>
      <div
        className={`px-6 py-3 rounded-xl cursor-pointer transition ${
          pathname === href
            ? "bg-white text-[#3949AB] font-semibold shadow"
            : "text-white hover:bg-white/20"
        }`}
      >
        {label}
      </div>
    </Link>
  );

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen">

      {/* FIXED SIDEBAR */}
      <div
        className="fixed left-0 top-0 h-screen w-64 p-6 flex flex-col justify-between shadow-xl"
        style={{
          background: "linear-gradient(180deg, #5C6BC0, #7986CB)",
        }}
      >
        <div>
          <h1 className="text-white text-2xl font-bold mb-10">
            AU Connect
          </h1>

          <div className="space-y-3">
            {navItem("/admin", "Dashboard")}
            {navItem("/admin/clubs", "Manage Clubs")}
            {navItem("/admin/events", "Manage Events")}
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-white text-[#3949AB] py-2 rounded-xl font-medium hover:shadow-md transition"
        >
          Logout
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="ml-64 min-h-screen bg-[#E8EAF6] overflow-y-auto p-10">
        {children}
      </div>
    </div>
  );
}