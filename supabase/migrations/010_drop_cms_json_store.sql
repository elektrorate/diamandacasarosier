-- Migration 010: remove temporary JSON document store
-- The CMS persists in normalized SQL tables. This only cleans up the
-- transitional table from the previous local-file replacement attempt.

drop table if exists public.cms_json_store;
