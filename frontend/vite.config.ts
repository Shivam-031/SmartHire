import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl =
    env.API_BASE_URL ||
    env.VITE_API_BASE_URL ||
    (mode === 'production' ? 'https://smarthire-o5an.onrender.com' : 'http://localhost:5000')

  return {
    plugins: [react(), tailwindcss()],
    // Expose variables without mandatory VITE_ prefix (e.g., API_BASE_URL, GOOGLE_CLIENT_ID)
    envPrefix: ['VITE_', 'API_', 'GOOGLE_', 'REACT_APP_'],
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(
        env.GOOGLE_CLIENT_ID ||
          env.VITE_GOOGLE_CLIENT_ID ||
          '228003091405-8p3lrjrfg1mo4nal0sru1417j95hqgef.apps.googleusercontent.com'
      ),
    },
  }
})
