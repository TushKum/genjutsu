import{defineConfig}from'vite';
export default defineConfig({build:{chunkSizeWarningLimit:3500,rollupOptions:{onwarn(w,warn){if(w.code==='MODULE_LEVEL_DIRECTIVE')return;warn(w)}}}});
