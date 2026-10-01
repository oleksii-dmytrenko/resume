-- Transcripts of the "Ask me anything" chat, one row per message.
-- session_id groups turns from the same browser (chat_sid cookie) into a
-- conversation; created_at is UTC with millisecond precision for ordering.
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX chat_messages_session_idx ON chat_messages (session_id, id);
