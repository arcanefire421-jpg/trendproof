import { listRooms } from "../../../db/trendproof";

export const runtime = "edge";

export async function GET() {
  try {
    const rooms = await listRooms();
    return Response.json({ rooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
