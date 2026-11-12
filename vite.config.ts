import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Dev memakai jalur yang sama dengan produksi ("/api"), jadi cookie sesi
      // tetap first-party dan tidak ada CORS yang perlu diatur di lokal.
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: false,
        rewrite: (route) => route.replace(/^\/api/, ""),
      },
    },
  },
})
