"use client";

import { useMemo, useState } from "react";

type Direction = "up" | "down";
type Session = "open30" | "intraday" | "close";

const players = [
  { name: "Mia", day: 82, week: 74, month: 69, spread: 0.28, streak: 6 },
  { name: "Allen", day: 76, week: 71, month: 66, spread: 0.34, streak: 4 },
  { name: "Kai", day: 71, week: 68, month: 64, spread: 0.41, streak: 3 },
  { name: "Nora", day: 67, week: 65, month: 61, spread: 0.47, streak: 2 },
];

const marketTicks = [
  { time: "09:00", price: 614.5 },
  { time: "09:30", price: 621.0 },
  { time: "11:00", price: 618.5 },
  { time: "13:30", price: 626.0 },
];

const sessions: Record<Session, string> = {
  open30: "開盤 30 分鐘",
  intraday: "盤中趨勢",
  close: "收盤趨勢",
};

const dispersion = [
  { label: "強漲", value: 18, tone: "rise" },
  { label: "小漲", value: 34, tone: "rise" },
  { label: "小跌", value: 29, tone: "fall" },
  { label: "強跌", value: 19, tone: "fall" },
];

export default function Home() {
  const [symbol, setSymbol] = useState("TSM");
  const [session, setSession] = useState<Session>("open30");
  const [direction, setDirection] = useState<Direction>("up");
  const [entry, setEntry] = useState("615");
  const [exit, setExit] = useState("628");
  const [confidence, setConfidence] = useState(72);

  const latest = marketTicks[marketTicks.length - 1].price;
  const open = marketTicks[0].price;
  const actualDirection: Direction = latest >= open ? "up" : "down";
  const entryGap = Math.abs(Number(entry) - latest);
  const directionHit = direction === actualDirection;

  const score = useMemo(() => {
    const confidenceWeight = Math.round(confidence * 0.35);
    const priceWeight = Math.max(0, 35 - Math.round(entryGap * 2));
    const directionWeight = directionHit ? 30 : 0;
    return Math.min(100, confidenceWeight + priceWeight + directionWeight);
  }, [confidence, directionHit, entryGap]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="hero">
        <nav className="topbar" aria-label="主選單">
          <div className="brand">
            <span className="brand-mark">TP</span>
            <span>TrendProof</span>
          </div>
          <div className="nav-actions">
            <a href="#leaderboard">排行榜</a>
            <a href="#method">驗證方式</a>
            <a className="nav-button" href="#create-room">
              建立房間
            </a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">股市預測準確度競賽平台</p>
            <h1>讓每一次漲跌判斷，都能被市價驗證。</h1>
            <p className="hero-text">
              分享一個預測房間給朋友、客戶或社群。每位玩家在開盤前、盤中與收盤前提交股價趨勢、買點與賣點，
              系統用實際市場價格計算命中率、離散度與排行榜。
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#create-room">
                建立預測房間
              </a>
              <a className="secondary-action" href="#leaderboard">
                查看示範排行
              </a>
            </div>
          </div>

          <section className="prediction-panel" id="create-room" aria-label="提交預測">
            <div className="panel-header">
              <div>
                <p className="section-kicker">今日預測</p>
                <h2>提交你的市場判斷</h2>
              </div>
              <span className={directionHit ? "status hit" : "status miss"}>
                {directionHit ? "目前命中" : "等待修正"}
              </span>
            </div>

            <label>
              股票代號
              <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} />
            </label>

            <div className="segmented" role="group" aria-label="預測時段">
              {(Object.keys(sessions) as Session[]).map((key) => (
                <button
                  key={key}
                  className={session === key ? "active" : ""}
                  onClick={() => setSession(key)}
                  type="button"
                >
                  {sessions[key]}
                </button>
              ))}
            </div>

            <div className="direction-grid" role="group" aria-label="漲跌預測">
              <button
                className={direction === "up" ? "rise selected" : "rise"}
                onClick={() => setDirection("up")}
                type="button"
              >
                漲
              </button>
              <button
                className={direction === "down" ? "fall selected" : "fall"}
                onClick={() => setDirection("down")}
                type="button"
              >
                跌
              </button>
            </div>

            <div className="price-grid">
              <label>
                買點
                <input inputMode="decimal" value={entry} onChange={(event) => setEntry(event.target.value)} />
              </label>
              <label>
                賣點
                <input inputMode="decimal" value={exit} onChange={(event) => setExit(event.target.value)} />
              </label>
            </div>

            <label>
              信心分數 {confidence}
              <input
                aria-label="信心分數"
                max="100"
                min="1"
                onChange={(event) => setConfidence(Number(event.target.value))}
                type="range"
                value={confidence}
              />
            </label>

            <div className="score-card">
              <div>
                <span>即時驗證分數</span>
                <strong>{score}</strong>
              </div>
              <p>
                {symbol || "TSM"} 現價 {latest.toFixed(1)}，相對開盤
                {actualDirection === "up" ? " 上漲" : " 下跌"}。買點距離現價 {entryGap.toFixed(1)}。
              </p>
            </div>
          </section>
        </div>
      </section>

      <section className="metric-strip" aria-label="平台指標">
        <div>
          <span>今日參賽</span>
          <strong>1,284</strong>
        </div>
        <div>
          <span>已驗證預測</span>
          <strong>38,920</strong>
        </div>
        <div>
          <span>平均離散度</span>
          <strong>0.37</strong>
        </div>
        <div>
          <span>最佳月命中率</span>
          <strong>69%</strong>
        </div>
      </section>

      <section className="workspace">
        <div className="market-card">
          <div className="section-heading">
            <p className="section-kicker">市價驗證</p>
            <h2>時間流動後，讓市場自動判分</h2>
          </div>
          <div className="timeline">
            {marketTicks.map((tick, index) => (
              <div className="tick" key={tick.time}>
                <span>{tick.time}</span>
                <div className="bar" style={{ height: `${36 + index * 16}px` }} />
                <strong>{tick.price.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="dispersion-card">
          <div className="section-heading">
            <p className="section-kicker">離散度</p>
            <h2>看出共識，也看出分歧</h2>
          </div>
          <div className="dispersion-list">
            {dispersion.map((item) => (
              <div className="dispersion-row" key={item.label}>
                <span>{item.label}</span>
                <div className="track">
                  <span className={item.tone} style={{ width: `${item.value * 1.75}%` }} />
                </div>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="leaderboard-section" id="leaderboard">
        <div className="section-heading">
          <p className="section-kicker">每日、每週、每月比賽</p>
          <h2>命中率排行榜</h2>
        </div>
        <div className="leaderboard">
          {players.map((player, index) => (
            <article className="player-card" key={player.name}>
              <div className="rank">#{index + 1}</div>
              <div className="player-main">
                <h3>{player.name}</h3>
                <p>連續命中 {player.streak} 次，離散度 {player.spread}</p>
              </div>
              <div className="player-stats">
                <span>日 {player.day}%</span>
                <span>週 {player.week}%</span>
                <span>月 {player.month}%</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="method-section" id="method">
        <div className="section-heading">
          <p className="section-kicker">產品流程</p>
          <h2>從分享網址到驗證排行</h2>
        </div>
        <div className="method-grid">
          <div>
            <span>01</span>
            <h3>建立房間</h3>
            <p>選擇股票、日期與比賽時段，產生可分享連結。</p>
          </div>
          <div>
            <span>02</span>
            <h3>提交預測</h3>
            <p>每位玩家輸入漲跌方向、信心分數、買點與賣點。</p>
          </div>
          <div>
            <span>03</span>
            <h3>市價驗證</h3>
            <p>到達開盤 30 分鐘、盤中或收盤節點，自動比對市場價格。</p>
          </div>
          <div>
            <span>04</span>
            <h3>排行與分享</h3>
            <p>每天、每週、每月產生命中率、離散度與玩家排行。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
