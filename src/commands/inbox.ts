import { Command } from 'commander';
import { getClient } from '../client.js';
import { output, success, error, formatInbox, type OutputOptions } from '../output.js';

interface InboxCreateOptions extends OutputOptions {
  domain?: string;
  username?: string;
  displayName?: string;
}

interface InboxListOptions extends OutputOptions {
  limit?: string;
}

export function registerInboxCommands(program: Command): void {
  const inbox = program
    .command('inbox')
    .description('Manage inboxes');

  inbox
    .command('create')
    .description('Create a new inbox')
    .option('--domain <domain>', 'Custom domain for the inbox')
    .option('--username <username>', 'Username for the inbox email')
    .option('--display-name <name>', 'Display name for the inbox')
    .option('--json', 'Output as JSON')
    .action(async (opts: InboxCreateOptions) => {
      try {
        const client = getClient();
        const request: {
          domain?: string;
          username?: string;
          displayName?: string;
        } = {};
        
        if (opts.domain) request.domain = opts.domain;
        if (opts.username) request.username = opts.username;
        if (opts.displayName) request.displayName = opts.displayName;

        const result = await client.inboxes.create(Object.keys(request).length > 0 ? request : undefined);
        
        if (opts.json) {
          output(result, opts);
        } else {
          success('Inbox created successfully');
          console.log('');
          output(formatInbox(result), opts);
        }
      } catch (err) {
        handleError(err, opts);
      }
    });

  inbox
    .command('list')
    .description('List all inboxes')
    .option('--limit <n>', 'Maximum number of inboxes to return')
    .option('--json', 'Output as JSON')
    .action(async (opts: InboxListOptions) => {
      try {
        const client = getClient();
        const request: { limit?: number } = {};
        if (opts.limit) request.limit = parseInt(opts.limit, 10);

        const result = await client.inboxes.list(request);
        
        if (opts.json) {
          output(result, opts);
        } else {
          if (result.inboxes.length === 0) {
            console.log('No inboxes found.');
          } else {
            console.log(`Found ${result.count} inbox(es):\n`);
            result.inboxes.forEach((inb, index) => {
              if (index > 0) console.log('---');
              output(formatInbox(inb), opts);
            });
          }
        }
      } catch (err) {
        handleError(err, opts);
      }
    });

  inbox
    .command('get <inbox-id>')
    .description('Get inbox details')
    .option('--json', 'Output as JSON')
    .action(async (inboxId: string, opts: OutputOptions) => {
      try {
        const client = getClient();
        const result = await client.inboxes.get(inboxId);
        
        if (opts.json) {
          output(result, opts);
        } else {
          output(formatInbox(result), opts);
        }
      } catch (err) {
        handleError(err, opts);
      }
    });

  inbox
    .command('delete <inbox-id>')
    .description('Delete an inbox')
    .option('--json', 'Output as JSON')
    .action(async (inboxId: string, opts: OutputOptions) => {
      try {
        const client = getClient();
        await client.inboxes.delete(inboxId);
        
        if (opts.json) {
          output({ success: true, inboxId, message: 'Inbox deleted' }, opts);
        } else {
          success(`Inbox ${inboxId} deleted`);
        }
      } catch (err) {
        handleError(err, opts);
      }
    });
}

function handleError(err: unknown, opts: OutputOptions): void {
  if (opts.json) {
    const errorObj: Record<string, unknown> = { success: false };
    if (err instanceof Error) {
      errorObj.error = err.message;
      if ('statusCode' in err) {
        errorObj.statusCode = (err as { statusCode: number }).statusCode;
      }
      if ('body' in err) {
        errorObj.details = (err as { body: unknown }).body;
      }
    } else {
      errorObj.error = String(err);
    }
    console.log(JSON.stringify(errorObj, null, 2));
  } else {
    if (err instanceof Error) {
      error(err.message);
      if ('body' in err && typeof (err as { body: unknown }).body === 'object') {
        const body = (err as { body: Record<string, unknown> }).body;
        if (body && 'message' in body) {
          console.error(`  Details: ${body.message}`);
        }
      }
    } else {
      error(String(err));
    }
  }
  process.exit(1);
}
