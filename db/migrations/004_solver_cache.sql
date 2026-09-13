BEGIN;

CREATE TABLE IF NOT EXISTS solver_cache (
    cache_key   TEXT PRIMARY KEY,
    response    JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solver_cache_expires ON solver_cache(expires_at);

COMMIT;
