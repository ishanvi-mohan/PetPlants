import { useState } from "react";
import { useGarden } from "@/context/GardenContext";
import type { GardenSession } from "@/lib/garden";

type Mode = "pick" | "create" | "join";

export default function Onboarding() {
  const { setSession } = useGarden();
  const [mode, setMode] = useState<Mode>("pick");
  const [gardenName, setGardenName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getOrCreateDeviceId(): string {
    let id = localStorage.getItem("petplants_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("petplants_device_id", id);
    }
    return id;
  }

  async function handleCreate() {
    if (!gardenName.trim() || !memberName.trim()) {
      setError("Fill in both fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gardens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gardenName: gardenName.trim(),
          memberName: memberName.trim(),
          deviceId: getOrCreateDeviceId(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create garden");
      }
      const data = await res.json() as GardenSession;
      setSession(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim() || !memberName.trim()) {
      setError("Fill in both fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gardens/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode.trim().toUpperCase(),
          memberName: memberName.trim(),
          deviceId: getOrCreateDeviceId(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Garden not found");
      }
      const data = await res.json() as GardenSession;
      setSession(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="/icon-192.png"
            alt="PetPlants"
            className="w-20 h-20 mx-auto mb-5"
            style={{ imageRendering: "pixelated" }}
          />
          <h1 className="font-heading text-[#00ff87] text-base mb-2">PetPlants</h1>
          <p className="font-sans text-[#556080] text-xl">Care together, grow together</p>
        </div>

        {/* Pick mode */}
        {mode === "pick" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="pixel-button w-full py-4 font-heading text-[10px] text-[#00ff87]"
            >
              NEW GARDEN
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-4 font-heading text-[10px] text-[#556080] border border-[#2a2a4a] hover:border-[#556080] transition-colors"
            >
              JOIN GARDEN
            </button>
          </div>
        )}

        {/* Create */}
        {mode === "create" && (
          <div className="space-y-4">
            <h2 className="font-heading text-[10px] text-[#e8f4f8] mb-6">CREATE GARDEN</h2>

            <div>
              <label className="font-heading text-[8px] text-[#556080] mb-2 block">GARDEN NAME</label>
              <input
                type="text"
                placeholder="Our Little Garden"
                value={gardenName}
                onChange={(e) => setGardenName(e.target.value)}
                className="pixel-input w-full px-3 py-3 font-sans text-xl text-[#e8f4f8] w-full focus:outline-none"
              />
            </div>

            <div>
              <label className="font-heading text-[8px] text-[#556080] mb-2 block">YOUR NAME</label>
              <input
                type="text"
                placeholder="Alex"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="pixel-input w-full px-3 py-3 font-sans text-xl text-[#e8f4f8] w-full focus:outline-none"
              />
            </div>

            {error && <p className="font-sans text-lg text-[#ff6b9d]">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="pixel-button w-full py-4 font-heading text-[10px] text-[#00ff87] disabled:opacity-40"
            >
              {loading ? "CREATING..." : "CREATE"}
            </button>

            <button
              onClick={() => { setMode("pick"); setError(""); }}
              className="w-full font-heading text-[8px] text-[#556080] py-2 hover:text-[#e8f4f8]"
            >
              ← BACK
            </button>
          </div>
        )}

        {/* Join */}
        {mode === "join" && (
          <div className="space-y-4">
            <h2 className="font-heading text-[10px] text-[#e8f4f8] mb-6">JOIN GARDEN</h2>

            <div>
              <label className="font-heading text-[8px] text-[#556080] mb-2 block">JOIN CODE</label>
              <input
                type="text"
                placeholder="A3K9P2"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="pixel-input w-full px-3 py-3 font-sans text-2xl text-[#00ff87] tracking-[0.4em] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-heading text-[8px] text-[#556080] mb-2 block">YOUR NAME</label>
              <input
                type="text"
                placeholder="Jordan"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="pixel-input w-full px-3 py-3 font-sans text-xl text-[#e8f4f8] focus:outline-none"
              />
            </div>

            {error && <p className="font-sans text-lg text-[#ff6b9d]">{error}</p>}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="pixel-button w-full py-4 font-heading text-[10px] text-[#00ff87] disabled:opacity-40"
            >
              {loading ? "JOINING..." : "JOIN"}
            </button>

            <button
              onClick={() => { setMode("pick"); setError(""); }}
              className="w-full font-heading text-[8px] text-[#556080] py-2 hover:text-[#e8f4f8]"
            >
              ← BACK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
