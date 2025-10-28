-- Migration: Move color from card to project
-- This migration adds a color column to the project table and removes it from the card table

-- Step 1: Add color column to project table (if not exists)
-- Since SQLite in D1 may not support ADD COLUMN IF NOT EXISTS, we'll handle this differently

-- Step 2: Create a new card table without the color column
DROP TABLE IF EXISTS card_new;
CREATE TABLE card_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(project_id) REFERENCES project(id)
);

-- Step 3: Copy data from old card table to new card table
INSERT INTO card_new (id, project_id, front, back, created_at)
SELECT id, project_id, front, back, created_at
FROM card;

-- Step 4: Migrate existing card colors to their projects (before dropping card table)
-- This will set the project color to the first card's color (if any)
UPDATE project
SET color = (
  SELECT color
  FROM card
  WHERE card.project_id = project.id
  AND card.color IS NOT NULL
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM card WHERE card.project_id = project.id AND card.color IS NOT NULL
);

-- Step 5: Drop the old card table
DROP TABLE card;

-- Step 6: Rename the new card table
ALTER TABLE card_new RENAME TO card;

-- Step 7: Recreate the index
CREATE INDEX IF NOT EXISTS idx_card_project ON card(project_id);
