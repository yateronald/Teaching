import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [{name:'analytics-fixture-auth',enforce:'pre',resolveId(source){if(source.endsWith('/contexts/AuthContext')) return fileURLToPath(new URL('./auth.ts',import.meta.url));}}, react()],
  optimizeDeps:{entries:['.analytics-preview/index.html']},
  server:{host:'127.0.0.1',port:5179,strictPort:true},
});

