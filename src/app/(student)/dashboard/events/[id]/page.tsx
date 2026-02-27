"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function StudentEventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = String(params?.id || "");

  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState("");
  const [reason, setReason] = useState("");

  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const decoded: any = jwt.decode(token);
    if (decoded?.role !== "student") return router.push("/admin");

    loadData(decoded.userId);
  }, []);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadData = async (userId: string) => {
    try {
      const [userRes, eventsRes, regRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch("/api/events"),
        fetch("/api/registrations"),
      ]);

      const userData = await safeJson(userRes);
      const eventsData = await safeJson(eventsRes);
      const regData = await safeJson(regRes);

      setUser(userData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setRegistrations(Array.isArray(regData) ? regData : []);

      setStudentName(userData?.name || "");
      setMajor(userData?.major || "");
    } catch {
      setErr("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const event = useMemo(() => {
    return events.find((e) => String(e._id) === eventId);
  }, [events, eventId]);

  const alreadyRegistered = useMemo(() => {
    if (!user) return false;
    return registrations.some(
      (r) =>
        String(r.userId) === String(user._id) &&
        String(r.eventId) === String(event?._id)
    );
  }, [registrations, user, event]);

  const handleRegister = async () => {
    if (!studentName || !studentId || !major) {
      setSubmitMsg("Please fill all required fields.");
      return;
    }

    if (!user || !event) {
      setSubmitMsg("User or event not loaded.");
      return;
    }

    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        eventId: event._id, // ✅ FIXED HERE
      }),
    });

    const data = await safeJson(res);

    if (res.ok) {
      setSubmitMsg("✅ Registered successfully!");

      const regRes = await fetch("/api/registrations");
      const regData = await safeJson(regRes);
      setRegistrations(Array.isArray(regData) ? regData : []);
    } else {
      setSubmitMsg(data?.message || "Registration failed.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (err) return <div>{err}</div>;
  if (!event) return <div>No event found.</div>;

  return (
    <div className="space-y-8">

      {/* Event Info */}
      <div className="bg-white p-8 rounded-2xl shadow">
        <p className="text-sm text-purple-500">
          {new Date(event.date).toDateString()}
        </p>
        <h1 className="text-2xl font-bold text-purple-800 mt-2">
          {event.title}
        </h1>
        <p className="text-gray-600 mt-2">
          📍 {event.location}
        </p>
        <p className="text-gray-700 mt-4 whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* Registration */}
      <div className="bg-white p-8 rounded-2xl shadow">
        <h2 className="text-lg font-semibold text-purple-700">
          Event Registration
        </h2>

        {alreadyRegistered ? (
          <p className="mt-4 text-green-600">
            ✅ You already registered for this event.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your Name"
                className="border px-4 py-3 rounded-xl"
              />

              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Student ID"
                className="border px-4 py-3 rounded-xl"
              />

              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Major"
                className="border px-4 py-3 rounded-xl"
              />

              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="border px-4 py-3 rounded-xl"
              />
            </div>

            <button
              onClick={handleRegister}
              className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-xl"
            >
              Register
            </button>

            {submitMsg && (
              <p className="mt-4 text-sm">{submitMsg}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}