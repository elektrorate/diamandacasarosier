alter table if exists public.blog_posts
  add column if not exists hero jsonb not null default '{}'::jsonb;

create or replace function public.try_parse_jsonb(value text)
returns jsonb
language plpgsql
immutable
as $$
begin
  return value::jsonb;
exception when others then
  return null;
end;
$$;

with parsed as (
  select id, public.try_parse_jsonb(content) as doc
  from public.blog_posts
  where content is not null and left(ltrim(content), 1) = '{'
)
update public.blog_posts as post
set
  hero = coalesce(parsed.doc -> 'hero', post.hero, '{}'::jsonb),
  content = coalesce(parsed.doc ->> 'body', post.content, '')
from parsed
where post.id = parsed.id
  and parsed.doc is not null
  and (parsed.doc ? 'hero' or parsed.doc ? 'body');

drop function if exists public.try_parse_jsonb(text);
