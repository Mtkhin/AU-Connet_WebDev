"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = String(params?.id || "");

  const [user, setUser] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState("");
  const [reason, setReason] = useState("");

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
  }, [clubId]);

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
    setMsg("");

    try {
      const [uRes, cRes, mRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/clubs/${clubId}`),
        fetch(`/api/memberships`),
      ]);

      if (!uRes.ok || !cRes.ok || !mRes.ok)
        throw new Error("load error");

      const u = await safeJson(uRes);
      setUser(u);
      setClub(await safeJson(cRes));
      const ms = await safeJson(mRes);
      setMemberships(Array.isArray(ms) ? ms : []);
      setMajor(u?.major || "");
    } catch {
      setErr("Failed to load club detail");
    }

    setLoading(false);
  }

  const myMembership = useMemo(() => {
    if (!user?._id) return null;
    return memberships.find(
      (m) =>
        String(m.userId) === String(user._id) &&
        String(m.clubId) === String(clubId)
    );
  }, [memberships, user, clubId]);

  const isJoined = Boolean(myMembership);

  async function joinClub() {
    /* UNCHANGED */
  }

  async function leaveClub() {
    /* UNCHANGED */
  }

  if (loading) return <div>Loading...</div>;
  if (!club) return <div>Club not found</div>;

  const cleaned = String(club.name || "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  const logoSrc = `/icons/${cleaned}.png`;

  return (
    <div className="space-y-8">

      <div
        className="bg-white rounded-3xl shadow-md p-8"
        style={{ border: `1px solid ${palette.lighter}` }}
      >
        <div className="flex items-start gap-6">
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center border"
            style={{ borderColor: palette.lighter }}
          >
            <img
              src={logoSrc}
              alt={club.name}
              className="h-16 w-16 object-contain"
            />
          </div>

          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: palette.primary }}
            >
              {club.name}
            </h1>
            <p className="text-gray-600 mt-2">
              {club.description}
            </p>
          </div>
        </div>
      </div>

      {isJoined ? (
        <div
          className="bg-white rounded-3xl shadow-md p-8"
          style={{ border: `1px solid ${palette.lighter}` }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: palette.primary }}
          >
            You are a member ✅
          </h2>

          <button
            onClick={leaveClub}
            className="mt-6 px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: "#EF4444" }}
          >
            Leave Club
          </button>
        </div>
      ) : (
        <div
          className="bg-white rounded-3xl shadow-md p-8"
          style={{ border: `1px solid ${palette.lighter}` }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: palette.primary }}
          >
            Join Request Form
          </h2>

          <div className="mt-6 space-y-4">
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student ID"
              className="w-full border rounded-xl px-4 py-3"
            />
            <input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Major"
              className="w-full border rounded-xl px-4 py-3"
            />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you want to join?"
              className="w-full border rounded-xl px-4 py-3 min-h-[110px]"
            />

            <button
              onClick={joinClub}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: palette.primary }}
            >
              Join Club
            </button>
          </div>
        </div>
      )}
    </div>
  );
}