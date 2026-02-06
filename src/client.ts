import { AgentMailClient } from 'agentmail';
import { getApiKey } from './config.js';

let clientInstance: AgentMailClient | null = null;

export function getClient(): AgentMailClient {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('Error: API key not set.');
    console.error('Set it via environment variable AGENTMAIL_API_KEY or run:');
    console.error('  agentmail config set-key <api-key>');
    process.exit(1);
  }

  clientInstance = new AgentMailClient({ apiKey });
  return clientInstance;
}
