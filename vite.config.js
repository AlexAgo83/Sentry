import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: [
                'src/main.js', 
                './index.html'
            ]
        }
    }
});