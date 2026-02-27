"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function YourClubsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    lighter: "#C5CAE9",
    bg: "#E8EAF6",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = decodeJwtPayload(token);
    if (!decoded?.userId) return router.push("/");
    if (decoded?.role !== "student") return router.push("/admin");

    load(decoded.userId);
  }, []);

  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  async function load(userId: string) {
    setLoading(true);
    setErr("");

    try {
      const [uRes, cRes, mRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch("/api/clubs"),
        fetch("/api/memberships"),
      ]);

      if (!uRes.ok) throw new Error("user");
      if (!cRes.ok) throw new Error("clubs");
      if (!mRes.ok) throw new Error("memberships");

      setUser(await safeJson(uRes));
      setClubs((await safeJson(cRes)) || []);
      setMemberships((await safeJson(mRes)) || []);
    } catch {
      setErr("Failed to load your clubs");
    }

    setLoading(false);
  }

  const myClubIds = useMemo(() => {
    if (!user?._id) return new Set<string>();
    const s = new Set<string>();
    for (const m of memberships) {
      if (String(m.userId) === String(user._id)) s.add(String(m.clubId));
    }
    return s;
  }, [memberships, user]);

  const myClubs = useMemo(() => {
    return clubs.filter((c) => myClubIds.has(String(c._id)));
  }, [clubs, myClubIds]);

  if (loading) return <div className="text-gray-600">Loading...</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!user) return <div className="text-gray-600">No user</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: palette.primary }}>
        Your Clubs
      </h1>

      {myClubs.length === 0 ? (
        <p className="text-gray-500">You haven’t joined any clubs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {myClubs.map((club) => {
            const cleaned = String(club.name || "")
              .replace(/\s+/g, "")
              .replace(/[^a-zA-Z0-9]/g, "");
            const logoSrc = `/icons/${cleaned}.png`;

            return (
              <Link key={club._id} href={`/dashboard/clubs/${club._id}`}>
                <div
                  className="bg-white rounded-3xl shadow-md p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  style={{ border: `1px solid ${palette.lighter}` }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm border"
                      style={{
                        backgroundColor: "#ffffff",
                        borderColor: palette.lighter,
                      }}
                    >
                      <img
                        src={logoSrc}
                        alt={club.name}
                        className="h-14 w-14 object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <h3
                        className="text-lg font-bold"
                        style={{ color: palette.primary }}
                      >
                        {club.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1 leading-snug">
                        {club.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: palette.bg,
                        color: palette.primary,
                      }}
                    >
                      AU Connect
                    </span>

                    <span
                      className="px-5 py-2 rounded-xl font-semibold border"
                      style={{
                        borderColor: palette.primary,
                        color: palette.primary,
                      }}
                    >
                      View
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}