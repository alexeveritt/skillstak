-- users
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- auth_key (email/password or oauth provider keys)
CREATE TABLE IF NOT EXISTS auth_key (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  hashed_password TEXT,
  FOREIGN KEY(user_id) REFERENCES user(id)
);
CREATE INDEX IF NOT EXISTS idx_auth_key_user ON auth_key(user_id);

-- projects
CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  foreground_color TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES user(id)
);
CREATE INDEX IF NOT EXISTS idx_project_user ON project(user_id);

-- cards
CREATE TABLE IF NOT EXISTS card (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(project_id) REFERENCES project(id)
);
CREATE INDEX IF NOT EXISTS idx_card_project ON card(project_id);

-- scheduling
CREATE TABLE IF NOT EXISTS card_schedule (
  card_id TEXT PRIMARY KEY,
  due_at TEXT NOT NULL,
  interval_days INTEGER NOT NULL,
  ease REAL NOT NULL,
  streak INTEGER NOT NULL,
  lapses INTEGER NOT NULL,
  FOREIGN KEY(card_id) REFERENCES card(id)
);
CREATE INDEX IF NOT EXISTS idx_schedule_due ON card_schedule(due_at);

-- review log (optional)
CREATE TABLE IF NOT EXISTS review (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('again','good')),
  FOREIGN KEY(card_id) REFERENCES card(id)
);
