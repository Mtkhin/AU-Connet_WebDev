"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const params = useSearchParams();
  const router = useRouter();

  const role = useMemo(() => {
    const r = params.get("role");
    return r === "admin" || r === "student" ? r : "student";
  }, [params]);

  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #5C6BC0, #9FA8DA)",
      }}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 transition-all">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#3949AB]">
            AU Connect
          </h1>

          <button
            className="text-sm text-[#5C6BC0] hover:underline"
            onClick={() => router.push("/")}
          >
            Back
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Selected role:{" "}
          <span className="font-semibold text-[#5C6BC0]">
            {role}
          </span>
        </p>

        {/* Toggle */}
        <div className="flex bg-[#E8EAF6] rounded-xl p-1">
          <button
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === "login"
                ? "bg-white shadow text-[#3949AB]"
                : "text-gray-500"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === "register"
                ? "bg-white shadow text-[#3949AB]"
                : "text-gray-500"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <LoginForm role={role} />
        ) : (
          <RegisterForm role={role} />
        )}
      </div>
    </main>
  );
}

function LoginForm({ role }: { role: "admin" | "student" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push(role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setMessage("Network/Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        className="w-full border border-[#C5CAE9] focus:border-[#5C6BC0] focus:ring-2 focus:ring-[#9FA8DA] outline-none px-4 py-3 rounded-xl transition"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border border-[#C5CAE9] focus:border-[#5C6BC0] focus:ring-2 focus:ring-[#9FA8DA] outline-none px-4 py-3 rounded-xl transition"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="w-full py-3 rounded-xl text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #5C6BC0, #7986CB)",
        }}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {message && (
        <p className="text-sm text-center text-red-500">
          {message}
        </p>
      )}
    </form>
  );
}

function RegisterForm({ role }: { role: "admin" | "student" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Register failed");
        return;
      }

      setMessage("Registration successful 🎉");
    } catch {
      setMessage("Network/Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        className="w-full border border-[#C5CAE9] focus:border-[#5C6BC0] focus:ring-2 focus:ring-[#9FA8DA] outline-none px-4 py-3 rounded-xl transition"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full border border-[#C5CAE9] focus:border-[#5C6BC0] focus:ring-2 focus:ring-[#9FA8DA] outline-none px-4 py-3 rounded-xl transition"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border border-[#C5CAE9] focus:border-[#5C6BC0] focus:ring-2 focus:ring-[#9FA8DA] outline-none px-4 py-3 rounded-xl transition"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="w-full py-3 rounded-xl text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #5C6BC0, #7986CB)",
        }}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {message && (
        <p className="text-sm text-center text-red-500">
          {message}
        </p>
      )}
    </form>
  );
}