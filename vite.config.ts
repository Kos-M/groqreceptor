import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import * as path from 'path';
// import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite'

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets"
  },
  base:'/groqreceptor/',
  // resolve: {
  //   alias: {
  //     "mylib": path.resolve(__dirname, "public/mylib.js"),
  //   },
  // },
  plugins: [react(), tailwindcss()],
})
