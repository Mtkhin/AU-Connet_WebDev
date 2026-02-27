"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ClubDetailPage() {
  const params = useParams();
  const rawId: any = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const router = useRouter();

  const [club, setClub] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageErr, setPageErr] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const palette = {
    primary: "#5C6BC0",
    mid: "#7986CB",
    bg: "#E8EAF6",
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setPageErr("");

      try {
        // ✅ fetch club
        const clubRes = await fetch(`/api/clubs/${id}`);
        const clubData = await clubRes.json().catch(() => null);

        // ✅ fetch memberships
        const memRes = await fetch("/api/memberships");
        const memData = await memRes.json().catch(() => []);

        setMemberships(Array.isArray(memData) ? memData : []);

        if (!clubRes.ok || !clubData || !clubData._id) {
          setClub(null);
          setPageErr(clubData?.message || "Club not found.");
          return;
        }

        setClub(clubData);
        setEditedName(clubData.name || "");
        setEditedDescription(clubData.description || "");
      } catch (err) {
        console.error(err);
        setClub(null);
        setPageErr("Failed to load club. Check terminal/server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;

  if (!club || !club._id) {
    return (
      <div style={{ backgroundColor: palette.bg }} className="min-h-full p-8 space-y-6">
        <button
          onClick={() => router.push("/admin")}
          className="text-sm font-medium"
          style={{ color: palette.primary }}
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-700 font-semibold">Club not found.</p>
          <p className="text-gray-500 mt-2">{pageErr || "Please try again."}</p>
        </div>
      </div>
    );
  }

  const joinedStudents = memberships.filter(
    (m: any) => String(m.clubId) === String(id)
  );

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/clubs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          description: editedDescription,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        setClub({
          ...club,
          name: editedName,
          description: editedDescription,
        });
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // ✅ FIXED DELETE:
  // 1) delete memberships for this club (so backend won’t block)
  // 2) then delete club
  const handleDelete = async () => {
    const confirmDelete = confirm("Delete this club?");
    if (!confirmDelete) return;

    try {
      // delete all memberships linked to this club first
      const toDelete = joinedStudents.map((m: any) => m?._id).filter(Boolean);

      if (toDelete.length > 0) {
        await Promise.all(
          toDelete.map((mid: string) =>
            fetch(`/api/memberships/${mid}`, { method: "DELETE" })
          )
        );
      }

      // now delete the club
      const res = await fetch(`/api/clubs/${id}`, { method: "DELETE" });

      if (res.ok) {
        router.push("/admin"); // ✅ homepage/dashboard
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const removeMember = async (membershipId: string) => {
    try {
      const res = await fetch(`/api/memberships/${membershipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // ✅ update UI without breaking other stuff
        setMemberships((prev) => prev.filter((x: any) => x._id !== membershipId));
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Remove failed");
      }
    } catch (err) {
      console.error(err);
      alert("Remove failed");
    }
  };

  return (
    <div
      style={{ backgroundColor: palette.bg }}
      className="min-h-full p-8 space-y-8"
    >
      {/* 🔙 BACK TO HOMEPAGE */}
      <button
        onClick={() => router.push("/admin")}
        className="text-sm font-medium"
        style={{ color: palette.primary }}
      >
        ← Back to Dashboard
      </button>

      {/* HEADER */}
      <div>
        {isEditing ? (
          <input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="text-3xl font-bold border-b outline-none bg-transparent"
            style={{ color: palette.primary }}
          />
        ) : (
          <h1 className="text-3xl font-bold" style={{ color: palette.primary }}>
            {club.name}
          </h1>
        )}

        <p className="text-gray-500 mt-1">Members: {joinedStudents.length}</p>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Description</h2>

        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full border rounded-xl p-3 outline-none"
            rows={4}
          />
        ) : (
          <p className="text-gray-600">
            {club.description || "No description available."}
          </p>
        )}
      </div>

      {/* MEMBERS (show studentId/major/reason if exists) */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Joined Students</h2>

        {joinedStudents.length === 0 ? (
          <p className="text-gray-500">No students joined yet.</p>
        ) : (
          <div className="space-y-4">
            {joinedStudents.map((m: any) => (
              <div
                key={m._id}
                className="flex justify-between items-start border-b pb-3"
              >
                <div className="space-y-1">
                  {/* ✅ Student ID (prefer studentId, fallback to userId) */}
                  <p className="font-semibold text-gray-700">
                    Student ID: {m.studentId || m.userId || "N/A"}
                  </p>

                  {/* ✅ Major */}
                  {m.major && (
                    <p className="text-sm text-gray-500">Major: {m.major}</p>
                  )}

                  {/* ✅ Reason */}
                  {m.reason && (
                    <p className="text-sm text-gray-500">Reason: {m.reason}</p>
                  )}
                </div>

                <button
                  onClick={() => removeMember(String(m._id))}
                  className="text-sm font-medium"
                  style={{ color: palette.mid }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-white font-semibold"
            style={{ backgroundColor: palette.primary }}
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-xl text-white font-semibold"
            style={{ backgroundColor: palette.primary }}
          >
            Edit Club
          </button>
        )}

        {/* ✅ consistent delete (no red) */}
        <button
          onClick={handleDelete}
          className="px-6 py-2 rounded-xl font-semibold border"
          style={{
            borderColor: palette.primary,
            color: palette.primary,
            backgroundColor: "white",
          }}
        >
          Delete Club
        </button>
      </div>
    </div>
  );
}