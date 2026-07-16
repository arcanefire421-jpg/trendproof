# TrendProof

TrendProof is a Taiwan stock direction prediction competition website.

Users choose a Taiwan-listed or OTC stock, select a prediction window, and submit whether they expect the stock to go up or down. The site reads Taiwan stock quote data through a server route and uses market prices to show whether the selected direction is currently correct.

## Features

- Taiwan stock symbol lookup, such as `2330`
- Listed and OTC market selection
- Prediction windows for open 30 minutes, intraday, and close
- Up/down direction prediction
- Confidence score
- Direction-based score preview
- Daily, weekly, and monthly accuracy leaderboard mock data
- Taiwan stock quote API route at `/api/tw-stock`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Published Site

https://trendproof.anysimn.chatgpt.site
