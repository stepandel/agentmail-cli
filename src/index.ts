#!/usr/bin/env node

import { Command } from 'commander';
import { registerInboxCommands } from './commands/inbox.js';
import { registerMessageCommands } from './commands/message.js';
import { registerConfigCommands } from './commands/config.js';

const program = new Command();

program
  .name('agentmail')
  .description('CLI tool for AgentMail - manage inboxes and messages')
  .version('1.0.0');

// Register command groups
registerConfigCommands(program);
registerInboxCommands(program);
registerMessageCommands(program);

// Parse and execute
program.parse();
