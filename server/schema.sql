-- Schema for the FAANG+ prep tracker sync API.
-- One row per sync-key. All customizable data (status, per-problem status,
-- annotations/code+images, notes, custom questions, custom topics, streak
-- activity, done-timestamps, theme) is stored as a single JSONB document.
-- Last-write-wins; the client merges on load.

CREATE TABLE IF NOT EXISTS user_data (
  user_id    TEXT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helps if you later query/inspect by recency.
CREATE INDEX IF NOT EXISTS user_data_updated_at_idx ON user_data (updated_at DESC);
