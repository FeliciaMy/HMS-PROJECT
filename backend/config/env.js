const fs = require('fs');
const path = require('path');
const dotenv = require('../../node_modules/dotenv');

// Load .env silently using dotenv.parse and inject into process.env only when not already set.
function findUp(filename, startDir) {
  let dir = path.resolve(startDir || process.cwd());
  const root = path.parse(dir).root;
  while (true) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) return candidate;
    if (dir === root) break;
    dir = path.dirname(dir);
  }
  return null;
}

function loadDotenv() {
  try {
    // 1) If user specified DOTENV_PATH, prefer that
    if (process.env.DOTENV_PATH) {
      const custom = path.resolve(process.env.DOTENV_PATH);
      if (fs.existsSync(custom)) {
        const parsed = dotenv.parse(fs.readFileSync(custom));
        Object.keys(parsed).forEach((k) => { if (process.env[k] === undefined) process.env[k] = parsed[k]; });
        return { count: Object.keys(parsed).length, path: custom };
      }
    }

    // 2) Project root .env (backend/..)
    const projectEnv = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(projectEnv)) {
      const parsed = dotenv.parse(fs.readFileSync(projectEnv));
      Object.keys(parsed).forEach((k) => { if (process.env[k] === undefined) process.env[k] = parsed[k]; });
      return { count: Object.keys(parsed).length, path: projectEnv };
    }

    // 3) Walk up from cwd to find an external .env
    const up = findUp('.env', process.cwd());
    if (up) {
      const parsed = dotenv.parse(fs.readFileSync(up));
      Object.keys(parsed).forEach((k) => { if (process.env[k] === undefined) process.env[k] = parsed[k]; });
      return { count: Object.keys(parsed).length, path: up };
    }

    return { count: 0, path: null };
  } catch (err) {
    try { require('dotenv').config(); } catch (e) { /* ignore */ }
    return { count: 0, path: null };
  }
}

const result = loadDotenv();
if (result.count) console.log(`✅ Loaded ${result.count} env var${result.count === 1 ? '' : 's'} from ${result.path}`);

// Central config exports — keep defaults for local development
const config = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hms_dev',
  JWT_SECRET: process.env.JWT_SECRET || 'changeme-in-production',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;
