import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const devServerUrl = 'http://127.0.0.1:5173';
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const electronCmd = process.platform === 'win32'
  ? path.join(root, 'node_modules', '.bin', 'electron.cmd')
  : path.join(root, 'node_modules', '.bin', 'electron');

function waitForServer(url, timeoutMs = 45000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(check, 750);
      });
      req.setTimeout(1000, () => req.destroy());
    };
    check();
  });
}

const vite = spawn(npmCmd, ['run', 'dev', '--workspace=frontend', '--', '--host', '127.0.0.1'], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});

function stop() {
  if (!vite.killed) vite.kill();
}

process.on('SIGINT', () => {
  stop();
  process.exit(130);
});

try {
  await waitForServer(devServerUrl);
  const electron = spawn(electronCmd, ['.'], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      SANZZ_DESKTOP_DEV_SERVER: devServerUrl,
    },
  });
  electron.on('exit', (code) => {
    stop();
    process.exit(code || 0);
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  stop();
  process.exit(1);
}

