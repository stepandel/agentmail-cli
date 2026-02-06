export interface OutputOptions {
  json?: boolean;
}

export function output(data: unknown, opts: OutputOptions): void {
  if (opts.json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    if (typeof data === 'string') {
      console.log(data);
    } else {
      prettyPrint(data);
    }
  }
}

export function prettyPrint(data: unknown, indent = 0): void {
  const prefix = '  '.repeat(indent);
  
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log(`${prefix}(empty)`);
      return;
    }
    data.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        console.log(`${prefix}[${index + 1}]`);
        prettyPrint(item, indent + 1);
      } else {
        console.log(`${prefix}- ${item}`);
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    for (const [key, value] of entries) {
      const displayKey = formatKey(key);
      if (value === null || value === undefined) {
        continue; // Skip null/undefined values in pretty print
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        console.log(`${prefix}${displayKey}:`);
        prettyPrint(value, indent + 1);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          continue; // Skip empty arrays
        }
        // Check if it's a simple array (strings, numbers)
        if (value.every(v => typeof v !== 'object' || v === null)) {
          console.log(`${prefix}${displayKey}: ${value.join(', ')}`);
        } else {
          console.log(`${prefix}${displayKey}:`);
          prettyPrint(value, indent + 1);
        }
      } else {
        console.log(`${prefix}${displayKey}: ${formatValue(value)}`);
      }
    }
  } else {
    console.log(`${prefix}${data}`);
  }
}

function formatKey(key: string): string {
  // Convert camelCase or snake_case to Title Case
  // Handle acronyms like "ID" properly (don't split them)
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Split on lowercase-to-uppercase transitions
    .replace(/^./, str => str.toUpperCase())
    .replace(/\bId\b/g, 'ID')  // Fix common acronym
    .trim();
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    // Check if it's an ISO date
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      const date = new Date(value);
      return date.toLocaleString();
    }
    return value;
  }
  return String(value);
}

export function success(message: string): void {
  console.log(`✓ ${message}`);
}

export function error(message: string): void {
  console.error(`✗ ${message}`);
}

export function formatInbox(inbox: {
  inboxId: string;
  podId?: string;
  displayName?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): Record<string, unknown> {
  return {
    'Inbox ID': inbox.inboxId,
    'Email': `${inbox.inboxId}`,
    'Display Name': inbox.displayName || '(not set)',
    'Created': (inbox.createdAt instanceof Date ? inbox.createdAt : new Date(inbox.createdAt)).toLocaleString(),
    'Updated': (inbox.updatedAt instanceof Date ? inbox.updatedAt : new Date(inbox.updatedAt)).toLocaleString(),
  };
}

export function formatMessage(msg: {
  messageId: string;
  inboxId: string;
  threadId: string;
  from: string;
  to: string[];
  subject?: string | null;
  preview?: string | null;
  text?: string | null;
  timestamp: Date | string;
  labels: string[];
}): Record<string, unknown> {
  return {
    'Message ID': msg.messageId,
    'Thread ID': msg.threadId,
    'From': msg.from,
    'To': msg.to.join(', '),
    'Subject': msg.subject || '(no subject)',
    'Preview': msg.preview ? msg.preview.substring(0, 100) + (msg.preview.length > 100 ? '...' : '') : '(empty)',
    'Date': (msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleString(),
    'Labels': msg.labels.length > 0 ? msg.labels.join(', ') : '(none)',
  };
}

export function formatMessageFull(msg: {
  messageId: string;
  inboxId: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[] | null;
  bcc?: string[] | null;
  subject?: string | null;
  text?: string | null;
  html?: string | null;
  timestamp: Date | string;
  labels: string[];
  size: number;
}): Record<string, unknown> {
  const result: Record<string, unknown> = {
    'Message ID': msg.messageId,
    'Thread ID': msg.threadId,
    'From': msg.from,
    'To': msg.to.join(', '),
  };
  
  if (msg.cc && msg.cc.length > 0) {
    result['CC'] = msg.cc.join(', ');
  }
  if (msg.bcc && msg.bcc.length > 0) {
    result['BCC'] = msg.bcc.join(', ');
  }
  
  result['Subject'] = msg.subject || '(no subject)';
  result['Date'] = (msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleString();
  result['Labels'] = msg.labels.length > 0 ? msg.labels.join(', ') : '(none)';
  result['Size'] = `${msg.size} bytes`;
  
  if (msg.text) {
    result['Body'] = msg.text;
  } else if (msg.html) {
    result['Body (HTML)'] = msg.html;
  }
  
  return result;
}
