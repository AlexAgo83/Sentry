import { defineConfig } from 'vite'
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: [
                './index.html'
            ]
        }
    }
});