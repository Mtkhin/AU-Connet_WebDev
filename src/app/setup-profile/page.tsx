"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export default function SetupProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [major, setMajor] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    "Technology",
    "Business",
    "Sports",
    "Arts",
    "Academic",
    "Social",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const decoded: any = jwt.decode(token);
    setUserId(decoded?.userId);
  }, [router]);

  const toggleInterest = (value: string) => {
    if (interests.includes(value)) {
      setInterests(interests.filter((i) => i !== value));
    } else {
      setInterests([...interests, value]);
    }
  };

  const handleSubmit = async () => {
    if (!major || interests.length === 0) {
      alert("Please select your major and at least one interest.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/users/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        major,
        interests,
      }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/dashboard");
    } else {
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-[500px]">
        <h1 className="text-2xl font-bold text-purple-600 mb-6">
          Tell us about you ✨
        </h1>

        <label className="block mb-2 font-medium">
          Your Major
        </label>
        <select
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          className="w-full mb-6 p-3 rounded-xl border"
        >
          <option value="">Select Major</option>
          <option>Computer Science</option>
          <option>Business Administration</option>
          <option>Engineering</option>
          <option>Communication Arts</option>
          <option>International Business</option>
        </select>

        <label className="block mb-2 font-medium">
          Interested In
        </label>

        <div className="flex flex-wrap gap-3 mb-6">
          {interestOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleInterest(item)}
              className={`px-4 py-2 rounded-full border transition ${
                interests.includes(item)
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition"
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}