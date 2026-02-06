import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  apiKey?: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.agentmail');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // Ignore errors, return empty config
  }
  return {};
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey(): string | undefined {
  // Environment variable takes precedence
  const envKey = process.env.AGENTMAIL_API_KEY;
  if (envKey) {
    return envKey;
  }
  
  // Fall back to config file
  const config = loadConfig();
  return config.apiKey;
}

export function setApiKey(apiKey: string): void {
  const config = loadConfig();
  config.apiKey = apiKey;
  saveConfig(config);
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
