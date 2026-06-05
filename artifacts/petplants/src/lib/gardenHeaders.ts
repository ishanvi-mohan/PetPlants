import { setDefaultHeaders } from "@workspace/api-client-react";

export function setGardenHeaders(gardenId: string | null, memberId: string | null) {
  if (gardenId && memberId) {
    setDefaultHeaders({ "x-garden-id": gardenId, "x-member-id": memberId });
  } else {
    setDefaultHeaders({});
  }
}
