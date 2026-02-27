"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [studentName, setStudentName] = useState("Student");

  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    lighter: "#C5CAE9",
    bg: "#E8EAF6",
    sidebar: "#7986CB",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = jwt.decode(token);
    if (decoded?.role !== "student") return router.push("/admin");

    if (decoded?.name) setStudentName(decoded.name);
  }, [router]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Your Clubs", href: "/dashboard/clubs" },
    { label: "Your Events", href: "/dashboard/events" },
  ];

  const isActive = (href: string) => pathname === href;

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div style={{ backgroundColor: palette.bg }} className="min-h-screen">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-64 px-6 py-8 flex flex-col"
        style={{
          backgroundColor: palette.sidebar,
        }}
      >
        <div className="mb-10">
          <h1 className="text-2xl font-extrabold text-white">AU Connect</h1>
          <p className="text-sm text-white/80 mt-1">Student Panel</p>

          <div className="mt-5 text-white/90 text-sm">
            Hi, <span className="font-semibold">{studentName}</span> 👋
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-2xl font-semibold transition ${
                isActive(item.href) ? "bg-white" : "text-white/90 hover:bg-white/10"
              }`}
              style={{
                color: isActive(item.href) ? palette.primary : undefined,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full bg-white px-4 py-3 rounded-2xl font-semibold"
            style={{ color: palette.primary }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-10">{children}</main>
    </div>
  );
}