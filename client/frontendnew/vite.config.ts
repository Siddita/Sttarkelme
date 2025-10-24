import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from 'child_process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    {
      name: 'generate-openapi-client',
      buildStart() {
        console.log('🔄 Generating OpenAPI client...');
        execSync('npm run gen:api:client', { stdio: 'inherit' });
      }
    },
    react({
      jsxImportSource: "react",
      jsxRuntime: "automatic"
    }),
    
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
