-- WhySpent Bot Database Schema
-- SQLite compatible

-- Users table: minimal data as specified
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  language TEXT DEFAULT 'en',
  joined_at TEXT NOT NULL,
  last_active_at TEXT NOT NULL,
  flags TEXT DEFAULT '{}'
);

-- Feedback table: stores user feedback
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Message history table: for future AI integration
CREATE TABLE IF NOT EXISTS message_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Broadcast logs: track broadcast delivery
CREATE TABLE IF NOT EXISTS broadcast_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  target_filter TEXT, -- e.g., 'all', 'lang:en', etc.
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_message_history_user_id ON message_history(user_id);
