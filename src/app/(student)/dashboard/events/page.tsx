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

export default function YourEventsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = decodeJwtPayload(token);
    if (!decoded?.userId) return router.push("/");
    if (decoded?.role !== "student") return router.push("/admin");

    load(decoded.userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const [uRes, eRes, rRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch("/api/events"),
        fetch("/api/registrations"),
      ]);

      if (!uRes.ok) throw new Error("user");
      if (!eRes.ok) throw new Error("events");
      if (!rRes.ok) throw new Error("registrations");

      const u = await safeJson(uRes);
      setUser(u);

      setEvents((await safeJson(eRes)) || []);
      setRegistrations((await safeJson(rRes)) || []);
    } catch {
      setErr("Failed to load your events");
    }

    setLoading(false);
  }

  const myEventIds = useMemo(() => {
    if (!user?._id) return new Set<string>();
    const s = new Set<string>();
    for (const r of registrations) {
      if (String(r.userId) === String(user._id)) s.add(String(r.eventId));
    }
    return s;
  }, [registrations, user]);

  const myEvents = useMemo(() => {
    return events.filter((e) => myEventIds.has(String(e._id)));
  }, [events, myEventIds]);

  if (loading) return <div className="text-gray-600">Loading...</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!user) return <div className="text-gray-600">No user</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-purple-700">Your Events</h1>

      {myEvents.length === 0 ? (
        <p className="text-gray-500">You haven’t registered for any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myEvents.map((event) => (
            <Link key={event._id} href={`/dashboard/events/${event._id}`}>
              <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition cursor-pointer">
                <p className="text-sm text-purple-500">{new Date(event.date).toDateString()}</p>
                <h3 className="font-semibold text-purple-800 text-lg mt-2">{event.title}</h3>
                <p className="text-gray-500 text-sm mt-1">📍 {event.location}</p>
                <p className="text-xs text-purple-500 mt-4">View details →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}