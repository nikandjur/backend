-- Расширение для поиска с опечатками
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Индекс для полнотекстового поиска
CREATE INDEX IF NOT EXISTS post_fts_idx 
  ON "Post" 
  USING GIN(to_tsvector('russian', title || ' ' || COALESCE(content, '')));

-- Триграммные индексы для поиска с опечатками
CREATE INDEX IF NOT EXISTS post_title_trgm_idx 
  ON "Post" 
  USING GIN(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS post_content_trgm_idx 
  ON "Post" 
  USING GIN(content gin_trgm_ops);
