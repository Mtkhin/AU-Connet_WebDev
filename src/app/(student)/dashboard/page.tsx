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

export default function StudentDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    light: "#9FA8DA",
    lighter: "#C5CAE9",
    bg: "#E8EAF6",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = decodeJwtPayload(token);
    if (!decoded?.userId) return router.push("/");
    if (decoded?.role !== "student") return router.push("/admin");

    loadData(decoded.userId);
  }, []);

  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  async function loadData(userId: string) {
    setLoading(true);

    try {
      const uRes = await fetch(`/api/users/${userId}`);
      if (uRes.ok) setUser(await safeJson(uRes));

      const cRes = await fetch("/api/clubs");
      if (cRes.ok) setClubs(await safeJson(cRes));

      const eRes = await fetch("/api/events");
      if (eRes.ok) setEvents(await safeJson(eRes));

      const mRes = await fetch("/api/memberships");
      if (mRes.ok) setMemberships(await safeJson(mRes));

      const rRes = await fetch("/api/registrations");
      if (rRes.ok) setRegistrations(await safeJson(rRes));
      else setRegistrations([]);

    } catch (err) {
      console.log("Dashboard load error:", err);
    }

    setLoading(false);
  }

  const myClubIds = useMemo(() => {
    if (!user?._id) return new Set<string>();
    const s = new Set<string>();
    memberships.forEach((m) => {
      if (String(m.userId) === String(user._id)) {
        s.add(String(m.clubId));
      }
    });
    return s;
  }, [memberships, user]);

  const availableClubs = clubs.filter(
    (club) => !myClubIds.has(String(club._id))
  );

  const myEventIds = useMemo(() => {
    if (!user?._id) return new Set<string>();
    const s = new Set<string>();
    registrations.forEach((r) => {
      if (String(r.userId) === String(user._id)) {
        s.add(String(r.eventId));
      }
    });
    return s;
  }, [registrations, user]);

  const membersByClubId = useMemo(() => {
    const map: Record<string, number> = {};
    memberships.forEach((m: any) => {
      const cid = String(m.clubId);
      map[cid] = (map[cid] || 0) + 1;
    });
    return map;
  }, [memberships]);

  if (loading) return <div className="text-gray-600">Loading...</div>;
  if (!user) return <div className="text-gray-600">User not found</div>;

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: palette.primary }}
        >
          Hi, {user.name} 👋
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Major: {user.major || "Not set"}
        </p>
      </div>

      {/* AVAILABLE CLUBS */}
      <section>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: palette.primary }}
        >
          Available Clubs
        </h2>

        {availableClubs.length === 0 ? (
          <p className="text-gray-500">No available clubs.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableClubs.map((club) => {
              const memberCount =
                membersByClubId[String(club._id)] || 0;

              const cleaned = String(club.name || "")
                .replace(/\s+/g, "")
                .replace(/[^a-zA-Z0-9]/g, "");
              const logoSrc = `/icons/${cleaned}.png`;

              return (
                <Link
                  key={club._id}
                  href={`/dashboard/clubs/${club._id}`}
                >
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
                          backgroundColor: "white",
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
      </section>

      {/* RECOMMENDED EVENTS — UNTOUCHED */}
      <section>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: palette.primary }}
        >
          Recommended Events
        </h2>

        {events.length === 0 ? (
          <p className="text-gray-500">No events available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Link
                key={event._id}
                href={`/dashboard/events/${event._id}`}
              >
                <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition cursor-pointer">
                  <p className="text-sm text-purple-500">
                    {new Date(event.date).toDateString()}
                  </p>
                  <h3 className="font-semibold text-purple-800 text-lg mt-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {event.location}
                  </p>

                  {myEventIds.has(String(event._id)) && (
                    <p className="text-xs text-green-600 mt-3">
                      ✅ You registered
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}