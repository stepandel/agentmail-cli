import { Command } from 'commander';
import { getClient } from '../client.js';
import { output, success, error, formatMessage, formatMessageFull, type OutputOptions } from '../output.js';

interface MessageSendOptions extends OutputOptions {
  from: string;
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  cc?: string;
  bcc?: string;
}

interface MessageListOptions extends OutputOptions {
  limit?: string;
}

export function registerMessageCommands(program: Command): void {
  const message = program
    .command('message')
    .description('Manage messages');

  message
    .command('send')
    .description('Send a new message')
    .requiredOption('--from <inbox-id>', 'Inbox ID to send from')
    .requiredOption('--to <email>', 'Recipient email address(es), comma-separated')
    .option('--subject <subject>', 'Email subject')
    .option('--text <body>', 'Plain text body')
    .option('--html <body>', 'HTML body')
    .option('--cc <emails>', 'CC recipients, comma-separated')
    .option('--bcc <emails>', 'BCC recipients, comma-separated')
    .option('--json', 'Output as JSON')
    .action(async (opts: MessageSendOptions) => {
      try {
        const client = getClient();
        
        const toAddresses = opts.to.split(',').map(e => e.trim());
        const ccAddresses = opts.cc ? opts.cc.split(',').map(e => e.trim()) : undefined;
        const bccAddresses = opts.bcc ? opts.bcc.split(',').map(e => e.trim()) : undefined;
        
        const request: {
          to?: string[];
          subject?: string;
          text?: string;
          html?: string;
          cc?: string[];
          bcc?: string[];
        } = {
          to: toAddresses,
        };
        
        if (opts.subject) request.subject = opts.subject;
        if (opts.text) request.text = opts.text;
        if (opts.html) request.html = opts.html;
        if (ccAddresses) request.cc = ccAddresses;
        if (bccAddresses) request.bcc = bccAddresses;

        const result = await client.inboxes.messages.send(opts.from, request);
        
        if (opts.json) {
          output(result, opts);
        } else {
          success('Message sent successfully');
          console.log(`  Message ID: ${result.messageId}`);
          console.log(`  Thread ID: ${result.threadId}`);
        }
      } catch (err) {
        handleError(err, opts);
      }
    });

  message
    .command('list <inbox-id>')
    .description('List messages in an inbox')
    .option('--limit <n>', 'Maximum number of messages to return')
    .option('--json', 'Output as JSON')
    .action(async (inboxId: string, opts: MessageListOptions) => {
      try {
        const client = getClient();
        const request: { limit?: number } = {};
        if (opts.limit) request.limit = parseInt(opts.limit, 10);

        const result = await client.inboxes.messages.list(inboxId, request);
        
        if (opts.json) {
          output(result, opts);
        } else {
          if (result.messages.length === 0) {
            console.log('No messages found.');
          } else {
            console.log(`Found ${result.count} message(s):\n`);
            result.messages.forEach((msg, index) => {
              if (index > 0) console.log('---');
              output(formatMessage(msg), opts);
            });
          }
        }
      } catch (err) {
        handleError(err, opts);
      }
    });

  message
    .command('get <inbox-id> <message-id>')
    .description('Get a specific message')
    .option('--json', 'Output as JSON')
    .action(async (inboxId: string, messageId: string, opts: OutputOptions) => {
      try {
        const client = getClient();
        const result = await client.inboxes.messages.get(inboxId, messageId);
        
        if (opts.json) {
          output(result, opts);
        } else {
          output(formatMessageFull(result), opts);
        }
      } catch (err) {
        handleError(err, opts);
      }
    });

  // Note: The AgentMail SDK doesn't have a direct message delete method
  // Messages are managed through threads. We delete the thread instead.
  message
    .command('delete <inbox-id> <message-id>')
    .description('Delete a message (deletes the entire thread)')
    .option('--json', 'Output as JSON')
    .action(async (inboxId: string, messageId: string, opts: OutputOptions) => {
      try {
        const client = getClient();
        
        // First get the message to find its thread ID
        const msg = await client.inboxes.messages.get(inboxId, messageId);
        const threadId = msg.threadId;
        
        // Delete the thread
        await client.inboxes.threads.delete(inboxId, threadId);
        
        if (opts.json) {
          output({ 
            success: true, 
            messageId, 
            threadId,
            message: 'Thread containing message deleted' 
          }, opts);
        } else {
          success(`Thread ${threadId} (containing message ${messageId}) deleted`);
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
