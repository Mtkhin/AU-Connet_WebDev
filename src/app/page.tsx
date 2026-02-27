"use client";

import { useRouter } from "next/navigation";
import { Shield, User } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleSelect = (role: "admin" | "student") => {
    router.push(`/auth?role=${role}`); // ✅ untouched logic
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #5C6BC0, #9FA8DA)",
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-[400px] text-center transition-all">

        <h1 className="text-3xl font-bold text-[#3949AB] mb-4">
          AU Connect
        </h1>

        <p className="text-gray-500 mb-8">
          Choose your role to continue
        </p>

        <div className="space-y-4">

          {/* Admin Button */}
          <button
            onClick={() => handleSelect("admin")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #5C6BC0, #7986CB)",
            }}
          >
            <Shield size={20} />
            Continue as Admin
          </button>

          {/* Student Button */}
          <button
            onClick={() => handleSelect("student")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            style={{
              backgroundColor: "#E8EAF6",
              color: "#3949AB",
            }}
          >
            <User size={20} />
            Continue as Student
          </button>

        </div>
      </div>
    </main>
  );
}