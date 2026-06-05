export interface GardenSession {
  gardenId: string;
  gardenName: string;
  joinCode: string;
  memberId: string;
  memberName: string;
}

const KEY = "petplants_garden";

export function loadGardenSession(): GardenSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GardenSession;
  } catch {
    return null;
  }
}

export function saveGardenSession(session: GardenSession): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearGardenSession(): void {
  localStorage.removeItem(KEY);
}
