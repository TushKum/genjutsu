# GENJUTSU
An interactive spatial pitch deck about Japanese pop culture in India.

## Run
npm install
npm run dev

## Build
npm run build

The 3D scene (`src/Stage.jsx`) is lazy-loaded so the hero, chapters and navigation are usable while it streams in. Shared state and chapter copy live in `src/store.js`.

React 19, React Three Fiber, Drei, Rapier, React Three Postprocessing, Framer Motion and Zustand. All 3D models are procedural; no paid assets or API keys are required. Google Fonts require network access and fall back to system fonts.

The business model is a pitch concept. Collectible drops are local simulations and do not process payments. Audio is synthesized and opt-in.

Click artifacts or use the chapter buttons. Drag and release the kunai near a screen edge to trigger distortion. Drag on the fabric to erase it, or use the accessible reveal button. Escape closes chapters and the guide. Reset restores object positions.
