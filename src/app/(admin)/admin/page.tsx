"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function AdminDashboard() {
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [adminName, setAdminName] = useState<string>("Admin");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = jwt.decode(token);
    if (decoded?.role !== "admin") return router.push("/dashboard");

    if (decoded?.name) setAdminName(decoded.name);

    Promise.all([
      fetchClubs(),
      fetchEvents(),
      fetchMemberships(),
      fetchRegistrations(),
    ]);
  }, []);

  const fetchClubs = async () => {
    const res = await fetch("/api/clubs");
    const data = await res.json();
    setClubs(Array.isArray(data) ? data : []);
  };

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  };

  const fetchMemberships = async () => {
    const res = await fetch("/api/memberships");
    const data = await res.json();
    setMemberships(Array.isArray(data) ? data : []);
  };

  const fetchRegistrations = async () => {
    const res = await fetch("/api/registrations");
    const data = await res.json();
    setRegistrations(Array.isArray(data) ? data : []);
  };

  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    lighter: "#C5CAE9",
    bg: "#E8EAF6",
  };

  const stats = useMemo(() => {
    return [
      { label: "Total Clubs", value: clubs.length },
      { label: "Total Events", value: events.length },
      { label: "Total Memberships", value: memberships.length },
      { label: "Event Registrations", value: registrations.length },
    ];
  }, [clubs, events, memberships, registrations]);

  const membersByClubId = useMemo(() => {
    const map: Record<string, number> = {};
    memberships.forEach((m: any) => {
      const cid = String(m.clubId);
      map[cid] = (map[cid] || 0) + 1;
    });
    return map;
  }, [memberships]);

  const clubLogoSrc = (clubName: string) => {
    const cleaned = String(clubName || "")
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]/g, "");
    return `/icons/${cleaned}.png`;
  };

  return (
    <div style={{ backgroundColor: palette.bg }} className="min-h-full">
      {/* Reduced outer spacing */}
      <div className="space-y-6">

        {/* HEADER (slightly tighter spacing) */}
        <div>
          <h1
            className="text-4xl font-extrabold tracking-tight"
            style={{ color: palette.primary }}
          >
            Hey! {adminName} 👋 Welcome!
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Here’s an overview of your system
          </p>
        </div>

        {/* 🔥 COMPACT STATS */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, idx) => (
              <div
                key={s.label}
                className={`py-2 ${idx !== 0 ? "lg:border-l" : ""}`}
                style={{
                  borderColor: idx !== 0 ? palette.lighter : undefined,
                }}
              >
                <div className="px-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {s.label}
                  </p>
                  <p
                    className="mt-1 text-2xl font-bold"
                    style={{ color: palette.mid }}
                  >
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLUB SECTION */}
        <section className="space-y-4">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: palette.primary }}
            >
              Clubs
            </h2>
            <p className="text-gray-500 mt-1">
              View the clubs you created (with logos)
            </p>
          </div>

          {clubs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-6 text-gray-500">
              No clubs yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {clubs.map((club: any) => {
                const memberCount = membersByClubId[String(club._id)] || 0;

                return (
                  <div
                    key={club._id}
                    className="bg-white rounded-3xl shadow-md p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
                          src={clubLogoSrc(club.name)}
                          alt={club.name}
                          className="h-14 w-14 object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">
                          Members: {memberCount}
                        </p>

                        <h3
                          className="text-lg font-bold leading-tight"
                          style={{ color: palette.primary }}
                        >
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

                      <button
                        className="px-5 py-2 rounded-xl font-semibold transition-all duration-200"
                        style={{
                          backgroundColor: palette.primary,
                          color: "white",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            palette.mid)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            palette.primary)
                        }
                        onClick={() =>
                          router.push(`/admin/clubs/${club._id}`)
                        }
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