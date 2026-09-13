BEGIN;
CREATE INDEX IF NOT EXISTS idx_lo_embedding_hnsw ON learning_outcomes
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
COMMIT;
