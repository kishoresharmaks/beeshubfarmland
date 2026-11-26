/**
 * PM2 Ecosystem Configuration for BeesHub Farmland
 * Supports Blue-Green zero-downtime deployment on dual ports (3001 & 3002)
 */

const path = require('path');
const fs = require('fs');

const BASE_DIR = process.env.BEESHUB_DIR || '/var/www/beeshubfarmland';
const LOGS_DIR = path.join(BASE_DIR, 'shared', 'logs');

// Ensure log directory exists if writable
try {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore permission error if running outside server context
}

const currentStandaloneDir = path.join(BASE_DIR, 'current', '.next', 'standalone');

module.exports = {
  apps: [
    {
      name: 'beeshub-blue',
      script: 'server.js',
      cwd: process.env.BLUE_APP_DIR || currentStandaloneDir,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      listen_timeout: 15000,
      kill_timeout: 5000,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: path.join(LOGS_DIR, 'blue-error.log'),
      out_file: path.join(LOGS_DIR, 'blue-out.log'),
      merge_logs: true,
      time: true,
    },
    {
      name: 'beeshub-green',
      script: 'server.js',
      cwd: process.env.GREEN_APP_DIR || currentStandaloneDir,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      listen_timeout: 15000,
      kill_timeout: 5000,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      error_file: path.join(LOGS_DIR, 'green-error.log'),
      out_file: path.join(LOGS_DIR, 'green-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
