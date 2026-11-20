import { readFile, writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
import { createHostingConfig } from './hosting-config.mjs'

try {
  const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
  const config = createHostingConfig(env)
  if (process.argv.includes('--check')) {
    const existing = JSON.parse(await readFile('firebase.json', 'utf8'))
    const project = JSON.parse(await readFile('.firebaserc', 'utf8'))
    if (JSON.stringify(existing) !== JSON.stringify(config) || project.projects?.default !== env.VITE_FIREBASE_PROJECT_ID) {
      throw new Error('Deployment configuration changed. Run npm run prepare:hosting again.')
    }
    console.log('Deployment configuration is consistent. The predeploy hook will rebuild the application.')
  } else {
    await writeFile('firebase.json', JSON.stringify(config, null, 2) + '\n', 'utf8')
    await writeFile('.firebaserc', JSON.stringify({ projects: { default: env.VITE_FIREBASE_PROJECT_ID } }, null, 2) + '\n', 'utf8')
    console.log('Created firebase.json and .firebaserc. Nothing has been deployed.')
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unable to prepare deployment.')
  process.exitCode = 1
}
