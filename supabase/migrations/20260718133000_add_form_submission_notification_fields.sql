alter table public.form_submissions
  add column if not exists notification_status text,
  add column if not exists notification_provider text,
  add column if not exists notification_to text,
  add column if not exists notification_from text,
  add column if not exists notification_message_id text,
  add column if not exists notification_error text,
  add column if not exists notification_attempted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'form_submissions_notification_status_check'
      and conrelid = 'public.form_submissions'::regclass
  ) then
    alter table public.form_submissions
      add constraint form_submissions_notification_status_check
      check (
        notification_status is null
        or notification_status in ('disabled', 'missing_recipient', 'missing_api_key', 'sent', 'failed')
      );
  end if;
end $$;

create index if not exists form_submissions_notification_status_idx
  on public.form_submissions (notification_status)
  where notification_status is not null;