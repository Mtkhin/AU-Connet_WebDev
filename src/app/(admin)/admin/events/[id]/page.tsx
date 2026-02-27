"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminEventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId: any = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    clubId: "",
    keywords: "",
  });

  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    lighter: "#C5CAE9",
    bg: "#E8EAF6",
  };

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    setMessage("");

    try {
      const [eventRes, clubsRes, regRes] = await Promise.all([
        fetch(`/api/events/${id}`),
        fetch("/api/clubs"),
        fetch("/api/registrations"),
      ]);

      const eventData = await safeJson(eventRes);
      const clubsData = await safeJson(clubsRes);
      const regData = await safeJson(regRes);

      if (!eventRes.ok || !eventData?._id) {
        setEvent(null);
      } else {
        setEvent(eventData);
        setEdited({
          title: eventData.title || "",
          description: eventData.description || "",
          // for <input type="date"> we need YYYY-MM-DD
          date: eventData.date ? String(eventData.date).slice(0, 10) : "",
          location: eventData.location || "",
          clubId: eventData.clubId || "",
          keywords: Array.isArray(eventData.keywords)
            ? eventData.keywords.join(", ")
            : "",
        });
      }

      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setRegistrations(Array.isArray(regData) ? regData : []);
    } catch (e) {
      console.error(e);
      setEvent(null);
      setClubs([]);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const regsForThisEvent = useMemo(() => {
    return registrations.filter((r: any) => String(r.eventId) === String(id));
  }, [registrations, id]);

  const handleSave = async () => {
    try {
      const keywordsArr = edited.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: edited.title,
          description: edited.description,
          date: edited.date,
          location: edited.location,
          clubId: edited.clubId,
          keywords: keywordsArr,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setMessage(data?.message || "Update failed");
        return;
      }

      setEvent(data);
      setIsEditing(false);
      setMessage("Saved ✅");
    } catch (e) {
      console.error(e);
      setMessage("Update failed");
    }
  };

  const handleDelete = async () => {
    const ok = confirm("Delete this event?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await safeJson(res);

      if (!res.ok) {
        setMessage(data?.message || "Delete failed");
        return;
      }

      router.push("/admin/events");
    } catch (e) {
      console.error(e);
      setMessage("Delete failed");
    }
  };

  const removeRegistration = async (userId: string) => {
    try {
      const res = await fetch("/api/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eventId: id }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        alert(data?.message || "Remove failed");
        return;
      }

      setRegistrations((prev) =>
        prev.filter(
          (r: any) =>
            !(String(r.userId) === String(userId) && String(r.eventId) === String(id))
        )
      );
    } catch (e) {
      console.error(e);
      alert("Remove failed");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8">Event not found.</div>;

  return (
    <div style={{ backgroundColor: palette.bg }} className="min-h-full p-8 space-y-8">
      {/* BACK */}
      <button
        onClick={() => router.push("/admin/events")}
        className="text-sm font-medium"
        style={{ color: palette.primary }}
      >
        ← Back to Events
      </button>

      {/* HEADER */}
      <div className="space-y-1">
        {isEditing ? (
          <input
            value={edited.title}
            onChange={(e) => setEdited({ ...edited, title: e.target.value })}
            className="text-3xl font-bold border-b outline-none bg-transparent w-full"
            style={{ color: palette.primary, borderColor: palette.lighter }}
          />
        ) : (
          <h1 className="text-3xl font-bold" style={{ color: palette.primary }}>
            {event.title}
          </h1>
        )}

        <p className="text-gray-500">
          👥 {regsForThisEvent.length} registered
        </p>
      </div>

      {/* MESSAGE */}
      {message ? (
        <div
          className="bg-white rounded-2xl shadow px-4 py-3 text-sm"
          style={{ border: `1px solid ${palette.lighter}`, color: palette.primary }}
        >
          {message}
        </div>
      ) : null}

      {/* DETAILS */}
      <div className="bg-white rounded-3xl shadow p-6 space-y-4" style={{ border: `1px solid ${palette.lighter}` }}>
        <h2 className="text-lg font-bold" style={{ color: palette.primary }}>
          Event Details
        </h2>

        {/* date */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400">Date</p>
          {isEditing ? (
            <input
              type="date"
              value={edited.date}
              onChange={(e) => setEdited({ ...edited, date: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />
          ) : (
            <p className="text-gray-700">
              {event?.date ? new Date(event.date).toDateString() : "—"}
            </p>
          )}
        </div>

        {/* location */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400">Location</p>
          {isEditing ? (
            <input
              value={edited.location}
              onChange={(e) => setEdited({ ...edited, location: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />
          ) : (
            <p className="text-gray-700">{event.location || "—"}</p>
          )}
        </div>

        {/* club */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400">Club</p>
          {isEditing ? (
            <select
              value={edited.clubId}
              onChange={(e) => setEdited({ ...edited, clubId: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            >
              <option value="">Select Club</option>
              {clubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-700">
              {clubs.find((c) => String(c._id) === String(event.clubId))?.name || "—"}
            </p>
          )}
        </div>

        {/* description */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400">Description</p>
          {isEditing ? (
            <textarea
              rows={4}
              value={edited.description}
              onChange={(e) => setEdited({ ...edited, description: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
            />
          ) : (
            <p className="text-gray-700">{event.description || "No description"}</p>
          )}
        </div>

        {/* keywords */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400">Keywords</p>
          {isEditing ? (
            <input
              value={edited.keywords}
              onChange={(e) => setEdited({ ...edited, keywords: e.target.value })}
              className="w-full border rounded-xl px-4 py-2.5 outline-none"
              style={{ borderColor: palette.lighter }}
              placeholder="comma separated"
            />
          ) : event?.keywords?.length ? (
            <div className="flex flex-wrap gap-2">
              {event.keywords.map((k: string) => (
                <span
                  key={k}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: palette.bg, color: palette.primary }}
                >
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">—</p>
          )}
        </div>
      </div>

      {/* REGISTERED USERS */}
      <div className="bg-white rounded-3xl shadow p-6 space-y-4" style={{ border: `1px solid ${palette.lighter}` }}>
        <h2 className="text-lg font-bold" style={{ color: palette.primary }}>
          Registered Students
        </h2>

        {regsForThisEvent.length === 0 ? (
          <p className="text-gray-500">No one registered yet.</p>
        ) : (
          <div className="space-y-3">
            {regsForThisEvent.map((r: any) => (
              <div key={r._id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-semibold text-gray-700">
                    Student ID: {r.userId || "N/A"}
                  </p>
                </div>
                <button
                  className="text-sm font-medium"
                  style={{ color: palette.mid }}
                  onClick={() => removeRegistration(String(r.userId))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-white font-semibold"
            style={{ backgroundColor: palette.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.mid)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.primary)}
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-xl text-white font-semibold"
            style={{ backgroundColor: palette.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.mid)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.primary)}
          >
            Edit Event
          </button>
        )}

        <button
          onClick={handleDelete}
          className="px-6 py-2 rounded-xl font-semibold border"
          style={{
            borderColor: palette.primary,
            color: palette.primary,
            backgroundColor: "white",
          }}
        >
          Delete Event
        </button>
      </div>
    </div>
  );
}