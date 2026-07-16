import { NextRequest, NextResponse } from "next/server";

type TwseMessage = {
  c?: string;
  n?: string;
  ex?: string;
  z?: string;
  o?: string;
  h?: string;
  l?: string;
  y?: string;
  v?: string;
  d?: string;
  t?: string;
};

const fallbackQuote = {
  symbol: "2330",
  name: "台積電",
  market: "tse",
  price: 2470,
  open: 2430,
  high: 2470,
  low: 2420,
  previousClose: 2440,
  volume: 27573,
  date: "20260716",
  time: "13:30:00",
  source: "示範資料",
  isFallback: true,
};

const parseNumber = (value?: string) => {
  if (!value || value === "-" || value === "0.0000") {
    return 0;
  }

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildQuote = (message: TwseMessage) => {
  const previousClose = parseNumber(message.y);
  const price = parseNumber(message.z) || previousClose;
  const open = parseNumber(message.o) || previousClose;

  return {
    symbol: message.c ?? fallbackQuote.symbol,
    name: message.n ?? fallbackQuote.name,
    market: message.ex ?? fallbackQuote.market,
    price,
    open,
    high: parseNumber(message.h) || Math.max(price, open),
    low: parseNumber(message.l) || Math.min(price, open),
    previousClose,
    volume: parseNumber(message.v),
    date: message.d ?? "",
    time: message.t ?? "",
    source: "TWSE MIS 即時行情",
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "2330").replace(/\D/g, "").slice(0, 6);
  const market = searchParams.get("market") === "otc" ? "otc" : "tse";

  if (symbol.length < 4) {
    return NextResponse.json({ error: "Invalid Taiwan stock symbol" }, { status: 400 });
  }

  const channel = `${market}_${symbol}.tw`;
  const url = new URL("https://mis.twse.com.tw/stock/api/getStockInfo.jsp");
  url.searchParams.set("ex_ch", channel);
  url.searchParams.set("json", "1");
  url.searchParams.set("delay", "0");
  url.searchParams.set("_", Date.now().toString());

  try {
    const response = await fetch(url, {
      headers: {
        Referer: `https://mis.twse.com.tw/stock/fibest.jsp?stock=${symbol}`,
        "User-Agent": "TrendProof/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`TWSE responded ${response.status}`);
    }

    const payload = (await response.json()) as { msgArray?: TwseMessage[]; rtcode?: string };
    const message = payload.msgArray?.[0];

    if (payload.rtcode !== "0000" || !message) {
      throw new Error("TWSE quote not available");
    }

    return NextResponse.json(buildQuote(message), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ...fallbackQuote,
        symbol,
        market,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
