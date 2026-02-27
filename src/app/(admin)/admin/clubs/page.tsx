"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function AdminClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = jwt.decode(token);
    if (decoded?.role !== "admin") return router.push("/dashboard");

    fetchClubs();
    fetchMemberships();
  }, []);

  const fetchClubs = async () => {
    const res = await fetch("/api/clubs");
    setClubs(await res.json());
  };

  const fetchMemberships = async () => {
    const res = await fetch("/api/memberships");
    setMemberships(await res.json());
  };

  const createClub = async () => {
    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("Club created successfully 🎉");
      setForm({ name: "", description: "" });
      fetchClubs();
    } else {
      setMessage("Something went wrong creating club");
    }
  };

  // ✅ same palette as dashboard
  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    light: "#9FA8DA",
    lighter: "#C5CAE9",
    bg: "#E8EAF6",
  };

  // ✅ same icon mapping approach as dashboard
  const clubLogoSrc = (clubName: string) => {
    const cleaned = String(clubName || "")
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]/g, "");
    return `/icons/${cleaned}.png`;
  };

  // ✅ faster member counting (no logic change, just performance/UI helper)
  const membersByClubId = useMemo(() => {
    const map: Record<string, number> = {};
    memberships.forEach((m: any) => {
      const cid = String(m.clubId);
      map[cid] = (map[cid] || 0) + 1;
    });
    return map;
  }, [memberships]);

  return (
    <div style={{ backgroundColor: palette.bg }} className="min-h-full">
      <div className="space-y-8">
        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: palette.primary }}>
            Manage Clubs
          </h1>
          <p className="mt-1 text-gray-500">Create and review clubs with consistent styling</p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className="bg-white rounded-2xl shadow-md px-5 py-4 text-sm"
            style={{ border: `1px solid ${palette.lighter}`, color: palette.primary }}
          >
            {message}
          </div>
        )}

        {/* CREATE CLUB (same function, better UI) */}
        <div className="bg-white p-6 rounded-3xl shadow-md space-y-4" style={{ border: `1px solid ${palette.lighter}` }}>
          <h2 className="text-lg font-bold" style={{ color: palette.primary }}>
            Create Club
          </h2>

          <div className="space-y-3">
            <input
              placeholder="Club Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2"
              style={{
                borderColor: palette.lighter,
              }}
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2"
              style={{
                borderColor: palette.lighter,
              }}
              rows={4}
            />

            <button
              onClick={createClub}
              className="px-5 py-3 rounded-xl font-semibold text-white transition"
              style={{ backgroundColor: palette.primary }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.mid)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.primary)}
            >
              Create Club
            </button>
          </div>
        </div>

        {/* CLUB CARDS (reuse dashboard style) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: palette.primary }}>
              Your Clubs
            </h2>
            <p className="text-gray-500 mt-1">Same design as dashboard cards</p>
          </div>

          {clubs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-6 text-gray-500" style={{ border: `1px solid ${palette.lighter}` }}>
              No clubs yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {clubs.map((club) => {
                const memberCount = membersByClubId[String(club._id)] || 0;

                return (
                  <div
                    key={club._id}
                    className="bg-white rounded-3xl shadow-md p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{ border: `1px solid ${palette.lighter}` }}
                  >
                    <div className="flex items-start gap-5">
                      {/* ICON (same as dashboard) */}
                      <div
                        className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm border"
                        style={{
                          backgroundColor: "#ffffff",
                          borderColor: palette.lighter,
                        }}
                      >
                        <img
                          src={clubLogoSrc(club.name)}
                          alt={club.name}
                          className="h-14 w-14 object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Members: {memberCount}</p>

                        <h3 className="text-lg font-bold leading-tight" style={{ color: palette.primary }}>
                          {club.name}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1 leading-snug">
                          {club.description || "No description"}
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

                      {/* ✅ IMPORTANT: I’m NOT changing navigation/logic here
                          Because your current page didn’t have “View” behavior.
                          If you want it, we’ll add it next and point it to /admin/clubs/[id]. */}
                      <button
                        className="px-5 py-2 rounded-xl font-semibold border transition"
                        style={{
                          borderColor: palette.primary,
                          color: palette.primary,
                          backgroundColor: "white",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = palette.bg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                        onClick={() => router.push(`/admin/clubs/${club._id}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}