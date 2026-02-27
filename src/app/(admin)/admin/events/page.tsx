"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function AdminEventsPage() {
  const router = useRouter();

  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    clubId: "",
    keywords: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = jwt.decode(token);
    if (decoded?.role !== "admin") return router.push("/dashboard");

    fetchClubs();
    fetchEvents();
    fetchRegistrations();
  }, []);

  const fetchClubs = async () => {
    const res = await fetch("/api/clubs");
    setClubs(await res.json());
  };

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  };

  const fetchRegistrations = async () => {
    const res = await fetch("/api/registrations");
    setRegistrations(await res.json());
  };

  const createEvent = async () => {
    const keywordsArr = form.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        date: form.date,
        location: form.location,
        clubId: form.clubId,
        keywords: keywordsArr,
      }),
    });

    if (res.ok) {
      setMessage("Event created successfully 🎉");
      setForm({
        title: "",
        description: "",
        date: "",
        location: "",
        clubId: "",
        keywords: "",
      });
      fetchEvents();
      fetchRegistrations();
    } else {
      setMessage("Something went wrong creating event");
    }
  };

  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    lighter: "#C5CAE9",
    bg: "#E8EAF6",
  };

  const registrationsByEventId = useMemo(() => {
    const map: Record<string, number> = {};
    registrations.forEach((r: any) => {
      const eid = String(r.eventId);
      map[eid] = (map[eid] || 0) + 1;
    });
    return map;
  }, [registrations]);

  return (
    <div style={{ backgroundColor: palette.bg }} className="min-h-full">
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: palette.primary }}
          >
            Manage Events
          </h1>
          <p className="text-gray-500 mt-1">Create and manage events</p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className="bg-white rounded-2xl shadow px-4 py-3 text-sm"
            style={{
              border: `1px solid ${palette.lighter}`,
              color: palette.primary,
            }}
          >
            {message}
          </div>
        )}

        {/* FORM */}
        <div
          className="bg-white p-6 rounded-3xl shadow space-y-4"
          style={{ border: `1px solid ${palette.lighter}` }}
        >
          <h2 className="text-lg font-bold" style={{ color: palette.primary }}>
            Create Event
          </h2>

          <div className="space-y-3">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />

            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />

            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />

            <select
              value={form.clubId}
              onChange={(e) => setForm({ ...form, clubId: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            >
              <option value="">Select Club</option>
              {clubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Keywords (comma separated)"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />

            <button
              onClick={createEvent}
              className="px-5 py-2.5 rounded-xl font-semibold text-white transition"
              style={{ backgroundColor: palette.primary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = palette.mid)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = palette.primary)
              }
            >
              Create Event
            </button>
          </div>
        </div>

        {/* EVENT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const regCount = registrationsByEventId[String(event._id)] || 0;

            return (
              <button
                key={event._id}
                type="button"
                onClick={() => router.push(`/admin/events/${event._id}`)}
                className="text-left bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden"
                style={{ border: `1px solid ${palette.lighter}` }}
              >
                <div
                  className="h-1.5"
                  style={{
                    background:
                      "linear-gradient(90deg, #5C6BC0, #7986CB, #9FA8DA)",
                  }}
                />

                <div className="p-4 space-y-2">
                  <p className="text-xs font-semibold" style={{ color: palette.mid }}>
                    {event?.date ? new Date(event.date).toDateString() : "No date"}
                  </p>

                  <h3 className="text-base font-bold" style={{ color: palette.primary }}>
                    {event?.title || "Untitled"}
                  </h3>

                  {event?.description ? (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {event.description}
                    </p>
                  ) : null}

                  <div className="flex justify-between items-center text-sm text-gray-500 pt-1">
                    <span>📍 {event?.location || "—"}</span>
                    <span>👥 {regCount}</span>
                  </div>

                  {event?.keywords?.length ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {event.keywords.map((k: string) => (
                        <span
                          key={k}
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{ backgroundColor: palette.bg, color: palette.primary }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}