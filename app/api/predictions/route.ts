import { deletePrediction, listRooms, upsertPrediction, type Direction } from "../../../db/trendproof";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      roomId?: string;
      nickname?: string;
      direction?: Direction;
      confidence?: number;
    };

    const nickname = payload.nickname?.trim() ?? "";
    if (!payload.roomId) {
      return Response.json({ error: "roomId is required" }, { status: 400 });
    }
    if (nickname.length < 2) {
      return Response.json({ error: "nickname must be at least 2 characters" }, { status: 400 });
    }
    if (payload.direction !== "up" && payload.direction !== "down") {
      return Response.json({ error: "direction must be up or down" }, { status: 400 });
    }

    const prediction = await upsertPrediction({
      roomId: payload.roomId,
      nickname,
      direction: payload.direction,
      confidence: Number(payload.confidence ?? 50),
    });
    const rooms = await listRooms();

    return Response.json({ prediction, rooms }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as {
      roomId?: string;
      nickname?: string;
    };

    const nickname = payload.nickname?.trim() ?? "";
    if (!payload.roomId) {
      return Response.json({ error: "roomId is required" }, { status: 400 });
    }
    if (nickname.length < 2) {
      return Response.json({ error: "nickname must be at least 2 characters" }, { status: 400 });
    }

    await deletePrediction({ roomId: payload.roomId, nickname });
    const rooms = await listRooms();
    return Response.json({ rooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
