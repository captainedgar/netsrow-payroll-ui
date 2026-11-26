import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import 'dotenv/config';

const loopback = '127.0.0.1';
const children = new Set();
let stopping = false;

function stop() {
  stopping = true;
  for (const child of children) child.kill();
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

function getPort(value, label) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${label} debe ser un puerto entre 1 y 65535.`);
  }
  return port;
}

async function checkPort(port, label) {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once('error', (error) => {
      reject(error.code === 'EADDRINUSE'
        ? new Error(`${label}: el puerto ${port} ya está ocupado. Detén su instancia anterior y vuelve a ejecutar dev:local.`)
        : error);
    });
    probe.listen(port, loopback, () => probe.close(resolvePort));
  });
}

function start(args, env) {
  const child = spawn(process.execPath, args, { env, stdio: 'inherit' });
  children.add(child);
  const done = new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('close', (code) => {
      children.delete(child);
      resolveExit(code);
    });
  });
  return done;
}

async function runPrisma(args, env) {
  const code = await start([resolve('node_modules/prisma/build/index.js'), ...args], env);
  if (code !== 0 && !stopping) {
    throw new Error(`Falló prisma ${args.join(' ')}. Si ves EPERM, cierra la API o Prisma Studio que tengan abierta la DLL.`);
  }
}

async function waitForHealth(url) {
  for (let attempt = 0; attempt < 40 && !stopping; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(750) });
      if (response.ok && (await response.json()).status === 'ok') return;
    } catch {
      // The process can still be starting.
    }
    await delay(250);
  }
  if (!stopping) throw new Error(`Falló la comprobación de salud en ${url}.`);
}

try {
  const api = getPort(process.env.API_PORT ?? '3002', 'API_PORT');
  const web = getPort(process.env.WEB_PORT ?? '3011', 'WEB_PORT');
  if (api === web) throw new Error('API_PORT y WEB_PORT deben ser distintos.');

  const database = new URL(process.env.DATABASE_URL ?? 'http://invalid');
  if (database.protocol !== 'postgresql:' || !['localhost', loopback, '[::1]'].includes(database.hostname)) {
    throw new Error('Configura DATABASE_URL con tu PostgreSQL local antes de ejecutar dev:local.');
  }

  await checkPort(api, 'API');
  await checkPort(web, 'Vite');
  const env = { ...process.env, API_PORT: String(api) };
  await runPrisma(['generate'], env);
  if (!stopping) await runPrisma(['migrate', 'deploy'], env);

  if (!stopping) {
    const apiDone = start(['--import', 'tsx', 'server/main.ts'], env);
    const apiEnded = apiDone.then(() => {
      if (!stopping) throw new Error('La API terminó. Revisa el error de NestJS.');
    });
    await Promise.race([waitForHealth(`http://${loopback}:${api}/api/health`), apiEnded]);

    if (!stopping) {
      const webDone = start([
        resolve('node_modules/vite/bin/vite.js'), '--host', loopback, '--port', String(web), '--strictPort',
      ], env);
      const webEnded = webDone.then(() => {
        if (!stopping) throw new Error('Vite terminó inesperadamente.');
      });
      const servers = Promise.race([apiEnded, webEnded]);
      await Promise.race([waitForHealth(`http://${loopback}:${web}/api/health`), servers]);
      if (!stopping) console.log(`NetsRow listo: http://localhost:${web}/login · Ctrl+C detiene ambos servicios.`);
      await servers;
    }
  }
} catch (error) {
  if (!stopping) {
    console.error(error instanceof Error ? error.message : 'No se pudo iniciar NetsRow.');
    process.exitCode = 1;
  }
} finally {
  stop();
}
