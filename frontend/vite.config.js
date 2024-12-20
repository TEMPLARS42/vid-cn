import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "CONFIG_");

  return {
    plugins: [react()],
    server: {
      port: env.CONFIG_SERVER_PORT,
      open: env.CONFIG_SERVER_OPEN,
      proxy: {
        '/api': {
          target: env.CONFIG_SERVER_PROXY
        }
      },
      strictPort: true,
    },
    define: {
      'process.env.CONFIG_FIREBASE_API_KEY': JSON.stringify(env.CONFIG_FIREBASE_API_KEY),
      'process.env.CONFIG_FIREBASE_PROJECT_ID': JSON.stringify(env.CONFIG_FIREBASE_PROJECT_ID),
      'process.env.CONFIG_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.CONFIG_FIREBASE_AUTH_DOMAIN),
      'process.env.CONFIG_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.CONFIG_FIREBASE_STORAGE_BUCKET),
      'process.env.CONFIG_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.CONFIG_FIREBASE_MESSAGING_SENDER_ID),
      'process.env.CONFIG_FIREBASE_APP_ID': JSON.stringify(env.CONFIG_FIREBASE_APP_ID),
      'process.env.CONFIG_FIREBASE_VAPID_KEY': JSON.stringify(env.CONFIG_FIREBASE_VAPID_KEY),
    },
  }
})
