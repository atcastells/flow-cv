import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import yaml from '@rollup/plugin-yaml'; 

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    yaml(), 
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
