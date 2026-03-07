import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks: {
                    firebase: ['firebase/compat/app', 'firebase/compat/firestore', 'firebase/compat/auth'],
                    vendor: ['react', 'react-dom', 'dexie', 'lucide-react', 'hls.js']
                }
            }
        }
    }
});
