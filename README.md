# AgentMail CLI

A command-line interface for [AgentMail](https://agentmail.to) - manage email inboxes and messages from your terminal.

## Installation

```bash
# Install globally
npm install -g @stepandel/agentmail-cli

# Or run directly with npx
npx @stepandel/agentmail-cli
```

## Configuration

### API Key

Set your API key using one of these methods:

**Option 1: Environment variable (recommended for CI/CD)**
```bash
export AGENTMAIL_API_KEY=your-api-key
```

**Option 2: Config file**
```bash
agentmail config set-key your-api-key
```

The config file is stored at `~/.agentmail/config.json`.

### View Configuration
```bash
agentmail config show
```

## Usage

### Inbox Commands

**Create an inbox:**
```bash
# Create with auto-generated email
agentmail inbox create

# Create with custom domain
agentmail inbox create --domain example.com

# Create with specific username
agentmail inbox create --username support --domain example.com

# Create with display name
agentmail inbox create --display-name "Support Team"
```

**List all inboxes:**
```bash
agentmail inbox list

# Limit results
agentmail inbox list --limit 10
```

**Get inbox details:**
```bash
agentmail inbox get <inbox-id>
```

**Delete an inbox:**
```bash
agentmail inbox delete <inbox-id>
```

### Message Commands

**Send a message:**
```bash
# Basic message
agentmail message send \
  --from <inbox-id> \
  --to recipient@example.com \
  --subject "Hello" \
  --text "Hello, World!"

# With HTML body
agentmail message send \
  --from <inbox-id> \
  --to recipient@example.com \
  --subject "Hello" \
  --html "<h1>Hello</h1><p>World!</p>"

# Multiple recipients
agentmail message send \
  --from <inbox-id> \
  --to "one@example.com,two@example.com" \
  --subject "Hello" \
  --text "Hello everyone!"

# With CC and BCC
agentmail message send \
  --from <inbox-id> \
  --to recipient@example.com \
  --cc "cc1@example.com,cc2@example.com" \
  --bcc hidden@example.com \
  --subject "Hello" \
  --text "Hello, World!"
```

**List messages in an inbox:**
```bash
agentmail message list <inbox-id>

# Limit results
agentmail message list <inbox-id> --limit 20
```

**Get a specific message:**
```bash
agentmail message get <inbox-id> <message-id>
```

**Delete a message:**
```bash
agentmail message delete <inbox-id> <message-id>
```

> Note: Deleting a message deletes the entire thread containing that message.

## Output Formats

All commands support a `--json` flag for machine-readable output:

```bash
# Human-readable (default)
agentmail inbox list

# JSON output
agentmail inbox list --json
```

### JSON Output Examples

**Inbox list:**
```json
{
  "count": 2,
  "inboxes": [
    {
      "inboxId": "abc123",
      "podId": "pod_xyz",
      "displayName": "Support",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Send message response:**
```json
{
  "messageId": "msg_abc123",
  "threadId": "thread_xyz789"
}
```

## Help

```bash
# General help
agentmail --help

# Command-specific help
agentmail inbox --help
agentmail message --help
agentmail config --help
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AGENTMAIL_API_KEY` | API key for authentication (takes precedence over config file) |

## Examples

### Workflow: Create inbox and send email

```bash
# 1. Configure API key
export AGENTMAIL_API_KEY=your-api-key

# 2. Create an inbox
agentmail inbox create --json | tee inbox.json
INBOX_ID=$(cat inbox.json | jq -r '.inboxId')

# 3. Send an email
agentmail message send \
  --from "$INBOX_ID" \
  --to customer@example.com \
  --subject "Welcome!" \
  --text "Thanks for signing up!"

# 4. Check for responses
agentmail message list "$INBOX_ID"
```

### Workflow: Process incoming messages

```bash
# Get all messages as JSON for processing
agentmail message list "$INBOX_ID" --json | jq '.messages[] | {from, subject}'
```

## License

MIT
