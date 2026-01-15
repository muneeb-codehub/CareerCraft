import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react({
            // Enable Fast Refresh
            fastRefresh: true,
            // Babel plugins for optimization
            babel: {
                plugins: [
                    // Remove console.log in production
                    process.env.NODE_ENV === 'production' && [
                        'transform-remove-console',
                        { exclude: ['error', 'warn'] }
                    ]
                ].filter(Boolean)
            }
        })
    ],
    server: {
        port: process.env.PORT || 5173,
        strictPort: false,
        host: true,
        open: true,
    },
    build: {
        outDir: 'dist',
        // Enable source maps for production debugging (optional)
        sourcemap: false,
        // Optimize chunks
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for common dependencies
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-state': ['zustand'],
                    'vendor-ui': ['lucide-react', 'react-hot-toast'],
                    'vendor-charts': ['chart.js', 'react-chartjs-2'],
                    'vendor-http': ['axios']
                },
                // Optimize chunk naming
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Minification options
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info']
            }
        }
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios']
    }
});