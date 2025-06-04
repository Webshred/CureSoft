import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",            // Allow LAN access
    port: 8080,            // Frontend port
    proxy: {
      '/api': 'http://localhost:5000'  // Backend proxy
    }
  }
}));

