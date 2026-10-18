# OTSUKAI · GENJUTSU prototype
Indian fandom. Japanese creators. A direct revenue connection.

A live prototype for JETRO-PS-02 (converting Japanese pop-culture fandom in India into sustainable revenue). Four 3D artifacts open the four stages of the brief; each chapter is a working demo, and all of them write to one shared royalty ledger:

1. **Audience discovery:** AI Demand Radar ranks title × city demand (search interest, community size, fan requests) with confidence levels. Simulated fan requests re-rank cities live.
2. **Localization & distribution:** official manga reader in English, Hindi, Tamil and Telugu with a ₹20 UPI sandbox unlock (order → collect request → settlement → unlock; 80% studio / 20% platform).
3. **Monetization & merch:** product passport scanner. OT-001/OT-002 verify with the 55/30/15 split of a ₹699 sale, OT-013 is flagged as a cloned tag, unknown serials can be reported as counterfeit.
4. **Community retention:** studio dashboard (royalties, units, unlocks, registration rate, counterfeit reports, ledger by city) and fan loyalty tiers. Inner-circle votes feed back into the Demand Radar.
5. **Pilot & the ask:** 18-month roadmap, pilot metrics and the three introductions needed.

Titles are fictional and all data is labelled sample data. Payments are a sandbox; nothing is charged. Market figures (40M+ fans, ₹3K–₹15K imports, 92% bootleg share) are brief-supplied estimates pending validation.

## Run
npm install
npm run dev

## Build
npm run build

## Deploy (Vercel)
Import the repo at vercel.com/new. `vercel.json` sets the Vite preset, rewrites the chapter paths to the app, `dist` output and long-lived caching for hashed assets. Or from a terminal: `npx vercel` (preview) / `npx vercel --prod`.

## Navigate
Press **Start the demo** on the home screen. Each step is its own page (`/discover`, `/localize`, `/monetize`, `/retain`, `/pilot`) with a one-line *Try it* instruction, and a **Next** button appears once you've done it. You can also jump with the numbered steps at the bottom of home or the top of each page, use ← →, or press Esc to return home. Old `#01`–`#05` links redirect.

## Structure
`src/main.jsx` app shell and chapter pages · `src/demos.jsx` the five working demos · `src/store.js` shared state and chapter copy · `src/data.js` sample data and the scoring/split logic · `src/Stage.jsx` the lazy-loaded React Three Fiber scene (rendering stops while a chapter page is open; resolution adapts to frame rate).

React 19, React Three Fiber, Drei, Rapier, React Three Postprocessing, Framer Motion and Zustand. All 3D models are procedural; no paid assets or API keys are required. Audio is synthesized and opt-in.
