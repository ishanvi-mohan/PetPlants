import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { loadGardenSession, saveGardenSession, clearGardenSession, type GardenSession } from "@/lib/garden";
import { setGardenHeaders } from "@/lib/gardenHeaders";

interface GardenContextValue {
  session: GardenSession | null;
  setSession: (s: GardenSession) => void;
  leaveGarden: () => void;
}

const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<GardenSession | null>(() => loadGardenSession());

  useEffect(() => {
    // Keep the fetch headers in sync with the session
    if (session) {
      setGardenHeaders(session.gardenId, session.memberId);
    } else {
      setGardenHeaders(null, null);
    }
  }, [session]);

  function setSession(s: GardenSession) {
    saveGardenSession(s);
    setSessionState(s);
  }

  function leaveGarden() {
    clearGardenSession();
    setSessionState(null);
  }

  return (
    <GardenContext.Provider value={{ session, setSession, leaveGarden }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used inside GardenProvider");
  return ctx;
}
