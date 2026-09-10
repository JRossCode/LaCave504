import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * En production, Vercel expose automatiquement le dossier `api/` en fonctions
 * serverless. Le serveur de dev de Vite, lui, ne sert que des fichiers statiques :
 * ce plugin monte le même handler sur /api/agenda pour que `npm run dev` se
 * comporte comme la prod, sans avoir besoin de `vercel dev`.
 */
function apiDevServer(mode) {
  return {
    name: 'lacave504-api-dev',
    apply: 'serve',
    configureServer(server) {
      // Vite n'expose au client que les variables préfixées VITE_ et ne remplit
      // pas process.env. On y injecte donc les variables serveur (ICAL_FEED_URL)
      // pour que le handler lise la même config en dev qu'en prod sur Vercel.
      const env = loadEnv(mode, process.cwd(), '')
      for (const key of ['ICAL_FEED_URL']) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }

      server.middlewares.use('/api/agenda', async (req, res, next) => {
        try {
          // Import à la volée pour profiter du rechargement à chaud du handler.
          const { default: handler } = await server.ssrLoadModule('/api/agenda.js')
          await handler(req, res)
        } catch (error) {
          server.config.logger.error(`[api/agenda] ${error.stack || error}`)
          next(error)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), apiDevServer(mode)],
  server: {
    port: 3000,
    open: true,
  },
}))
