import { Command } from 'commander';
import { getApiKey, setApiKey, getConfigPath, loadConfig } from '../config.js';
import { output, success, type OutputOptions } from '../output.js';

export function registerConfigCommands(program: Command): void {
  const config = program
    .command('config')
    .description('Manage CLI configuration');

  config
    .command('set-key <api-key>')
    .description('Set the API key for authentication')
    .action((apiKey: string) => {
      setApiKey(apiKey);
      success(`API key saved to ${getConfigPath()}`);
    });

  config
    .command('show')
    .description('Show current configuration')
    .option('--json', 'Output as JSON')
    .action((opts: OutputOptions) => {
      const storedConfig = loadConfig();
      const envKey = process.env.AGENTMAIL_API_KEY;
      const activeKey = getApiKey();

      const configInfo = {
        configPath: getConfigPath(),
        apiKeySource: envKey ? 'environment (AGENTMAIL_API_KEY)' : (storedConfig.apiKey ? 'config file' : 'not set'),
        apiKeySet: !!activeKey,
        apiKeyPreview: activeKey ? `${activeKey.substring(0, 8)}...${activeKey.substring(activeKey.length - 4)}` : null,
      };

      if (opts.json) {
        output(configInfo, opts);
      } else {
        console.log('AgentMail CLI Configuration');
        console.log('===========================');
        console.log(`Config file: ${configInfo.configPath}`);
        console.log(`API key source: ${configInfo.apiKeySource}`);
        if (configInfo.apiKeyPreview) {
          console.log(`API key: ${configInfo.apiKeyPreview}`);
        } else {
          console.log('API key: (not configured)');
        }
      }
    });
}
