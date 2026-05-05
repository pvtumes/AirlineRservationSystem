import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    allowedHosts: [
      ".ngrok-free.dev",
      ".loca.lt"
    ],
    proxy: {
      // AUTHENTICATION APIs (8085)
      '/api': {
        target: 'http://Umesh:8085',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },

      // WEB CHECK-IN APIs (8082)
      '/checkin-api': {
        target: 'http://Umesh:8082',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/checkin-api/, ''),
      },

      // FLIGHT SEARCH APIs (8081)
      '/search-api': {
        target: 'http://Umesh:8081',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/search-api/, ''),
      },

      // ✅ FLIGHT STATUS / GET FLIGHT APIs (8081)
      '/flight-api': {
        target: 'http://Umesh:8081',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/flight-api/, ''),
      },

      // SEATS APIs (8083)
      '/seats-api': {
        target: 'http://Umesh:8083',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/seats-api/, ''),
      },
      '/booking-api': {
        target: 'http://Umesh:8086',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/booking-api/, ''),
      },

      // USER PROFILE APIs (8088)
      '/user-api': {
        target: 'http://Umesh:8088',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/user-api/, ''),
      },

      // NEW BOOKING API (8089)
      '/new-booking-api': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/new-booking-api/, ''),
      },

      // BOOKING DETAILS API (8091)
      '/booking-details-api': {
        target: 'http://Umesh:8091',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/booking-details-api/, ''),
      },
    },
  },
})