# OTSUKAI · GENJUTSU prototype
Indian fandom. Japanese creators. A direct revenue connection.

A live prototype for JETRO-PS-02 (converting Japanese pop-culture fandom in India into sustainable revenue). Source: https://github.com/TushKum/genjutsu. Four 3D artifacts open the four stages of the brief; each chapter is a working demo, and all of them write to one shared royalty ledger:

1. **Audience discovery:** search a catalog of 350 real anime titles (studio, genre, MyAnimeList score and members from a 2023 Kaggle snapshot) and the Demand Radar ranks Indian cities for the chosen title (search interest, community size, fan requests) with a confidence level. City signals are simulated; fan requests from your city re-rank it live.
2. **Localization & distribution:** official manga reader in English, Hindi, Tamil and Telugu with a ₹20 UPI sandbox unlock (order → collect request → settlement → unlock; 80% studio / 20% platform), then a crowd-funded regional dub with ₹79 pledges that the payment gateway holds until the goal is met.
3. **Monetization & merch:** product passport scanner. Each tag carries an HMAC-SHA256 signature of its serial, checked in the browser with Web Crypto (demo key; production keeps it server-side). The genuine OT-001 tee verifies with the 55/30/15 split of a ₹699 sale, OT-013 has a valid signature but an impossible scan pattern (cloned), and OT-777's forged signature fails.
4. **Community retention:** studio royalty ledger (royalties, units, unlocks, registration rate, royalties and counterfeit reports by city) and fan loyalty tiers. Inner-circle votes feed back into the Demand Radar.
5. **Pilot & the ask:** the three introductions needed, a studio revenue simulator (fans, paying share, spend, tees, price → yearly royalties in ₹ and ¥), the 18-month roadmap, pilot targets, and sourced market context.

Demo products (Moon Reader, Crimson Crow) are fictional; city signals, ledger entries and pledges are labelled sample data. Payments are a sandbox; nothing is charged. Market figures on the Pilot page link to their sources; the deck's own assumptions (40M+ engaged fans, ₹3K–₹15K imports, 30% creator share) are marked as ours.

The title catalog (`src/catalog.json`) is adapted from the Kizuna prototype by @kkoena (MyAnimeList data via Kaggle). Only its factual fields are used; its India streaming labels were not carried over because most were placeholders.

## Pehla Kadam (CDSL Reimagine Ideathon 2026 prototype)
`public/pehla-kadam/index.html` is a separate, single-file prototype: a learn-by-doing investing sandbox for first-time investors (Hindi/English, retro Y2K look). Open the file directly in a browser; there is no build step, backend or API key. When the Vite site is deployed it is also served at `/pehla-kadam/`.

It is not a trading game. It teaches what happens at the depository layer: account opening with a mock 16-digit BO ID, T+1 settlement with mock CDSL SMS alerts, CDSL OTP (e-DIS) on sales, holdings and a monthly CAS, a simulated dividend, 1:1 bonus and 1:5 split, pledging with a risk check, nomination, e-voting on a mock AGM resolution, and a 5-message WhatsApp scam game. Prices are a seeded random walk for 10 large Indian companies over 60 trading days and are labelled as simulated; the corporate actions, brokers and resolutions are fictional. Progress persists in `localStorage` (the app still works if storage is blocked) and can be cleared from Desk → My account → Reset demo.

## Run
npm install
npm run dev

## Build
npm run build

## Deploy (Vercel)
Import the repo at vercel.com/new. `vercel.json` sets the Vite preset, rewrites the chapter paths to the app, `dist` output and long-lived caching for hashed assets. Or from a terminal: `npx vercel` (preview) / `npx vercel --prod`.

## Navigate
Press **Start the demo** on the home screen. Each step is its own page (`/discover`, `/localize`, `/monetize`, `/retain`, `/pilot`) with a one-line instruction, and a **Next** button appears once you've done it. You can also click a 3D object on home, use the numbered steps at the top of each page, use ← →, or press Esc (or the logo) to return home. Old `#01`–`#05` links redirect.

## Structure
`src/main.jsx` app shell and chapter pages · `src/demos.jsx` the five working demos · `src/store.js` shared state and chapter copy · `src/data.js` sample data and the scoring/split logic · `src/catalog.json` the title catalog (lazy-loaded on Discover) · `src/Stage.jsx` the lazy-loaded React Three Fiber scene (rendering stops while a chapter page is open; resolution adapts to frame rate; phones skip post-processing). The objects use a small hand-written spring instead of a physics engine, which keeps the 3D chunk under 1 MB.

React 19, React Three Fiber, Drei, React Three Postprocessing, Framer Motion and Zustand. All 3D models are procedural; no paid assets or API keys are required.
