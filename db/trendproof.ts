import { env } from "cloudflare:workers";

export type Direction = "up" | "down";
export type Session = "open30" | "intraday" | "close";

export type RoomSummary = {
  id: string;
  title: string;
  symbol: string;
  market: "tse" | "otc";
  session: Session;
  deadline: string;
  verifyAt: string;
  status: string;
  joined: number;
  bullish: number;
  bearish: number;
};

const seedRooms = [
  {
    id: "2330-open30",
    title: "台積電開盤 30 分鐘",
    symbol: "2330",
    market: "tse",
    session: "open30",
    deadline: "09:00 截止",
    verifyAt: "09:30 驗證",
  },
  {
    id: "2317-intraday",
    title: "鴻海盤中方向戰",
    symbol: "2317",
    market: "tse",
    session: "intraday",
    deadline: "11:30 截止",
    verifyAt: "13:00 驗證",
  },
  {
    id: "2454-close",
    title: "聯發科收盤預測",
    symbol: "2454",
    market: "tse",
    session: "close",
    deadline: "13:00 截止",
    verifyAt: "收盤驗證",
  },
] as const;

function getD1() {
  if (!env.DB) {
    throw new Error("D1 binding DB is unavailable.");
  }
  return env.DB;
}

export async function ensureTrendProofData() {
  const db = getD1();
  await db.batch([
    db.prepare(
      "CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, title TEXT NOT NULL, symbol TEXT NOT NULL, market TEXT NOT NULL, session TEXT NOT NULL, deadline TEXT NOT NULL, verify_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS predictions (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT NOT NULL REFERENCES rooms(id), nickname TEXT NOT NULL, direction TEXT NOT NULL, confidence INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE UNIQUE INDEX IF NOT EXISTS predictions_room_nickname_idx ON predictions (room_id, nickname)",
    ),
  ]);

  const statements = seedRooms.map((room) =>
    db
      .prepare(
        "INSERT OR IGNORE INTO rooms (id, title, symbol, market, session, deadline, verify_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'open')",
      )
      .bind(room.id, room.title, room.symbol, room.market, room.session, room.deadline, room.verifyAt),
  );
  await db.batch(statements);
}

export async function listRooms(): Promise<RoomSummary[]> {
  await ensureTrendProofData();
  const db = getD1();
  const result = await db
    .prepare(
      `SELECT
        r.id,
        r.title,
        r.symbol,
        r.market,
        r.session,
        r.deadline,
        r.verify_at as verifyAt,
        r.status,
        COUNT(p.id) as joined,
        SUM(CASE WHEN p.direction = 'up' THEN 1 ELSE 0 END) as upCount,
        SUM(CASE WHEN p.direction = 'down' THEN 1 ELSE 0 END) as downCount
      FROM rooms r
      LEFT JOIN predictions p ON p.room_id = r.id
      WHERE r.status = 'open'
      GROUP BY r.id
      ORDER BY r.created_at ASC`,
    )
    .all<{
      id: string;
      title: string;
      symbol: string;
      market: "tse" | "otc";
      session: Session;
      deadline: string;
      verifyAt: string;
      status: string;
      joined: number;
      upCount: number | null;
      downCount: number | null;
    }>();

  return result.results.map((room) => {
    const joined = Number(room.joined ?? 0);
    const upCount = Number(room.upCount ?? 0);
    const downCount = Number(room.downCount ?? 0);
    const bullish = joined > 0 ? Math.round((upCount / joined) * 100) : 0;
    const bearish = joined > 0 ? Math.round((downCount / joined) * 100) : 0;
    return {
      id: room.id,
      title: room.title,
      symbol: room.symbol,
      market: room.market,
      session: room.session,
      deadline: room.deadline,
      verifyAt: room.verifyAt,
      status: room.status,
      joined,
      bullish,
      bearish,
    };
  });
}

export async function upsertPrediction(input: {
  roomId: string;
  nickname: string;
  direction: Direction;
  confidence: number;
}) {
  await ensureTrendProofData();
  const db = getD1();
  const nickname = input.nickname.trim().slice(0, 24);
  const confidence = Math.max(1, Math.min(100, Math.round(input.confidence)));

  await db
    .prepare(
      `INSERT INTO predictions (room_id, nickname, direction, confidence)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(room_id, nickname)
      DO UPDATE SET direction = excluded.direction, confidence = excluded.confidence, updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(input.roomId, nickname, input.direction, confidence)
    .run();

  const result = await db
    .prepare(
      "SELECT id, room_id as roomId, nickname, direction, confidence, created_at as createdAt, updated_at as updatedAt FROM predictions WHERE room_id = ? AND nickname = ?",
    )
    .bind(input.roomId, nickname)
    .first();

  return result;
}
