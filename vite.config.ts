/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Inline (empty) PostCSS config stops Vite searching parent folders for a postcss.config;
  // Tailwind runs through its own Vite plugin.
  css: { postcss: {} },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // Worker threads (not forked processes) start reliably on Windows/sandboxed shells.
    pool: 'threads',
    // A few workers is plenty for this suite and avoids startup timeouts on busy/low-memory machines.
    maxWorkers: 2,
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
