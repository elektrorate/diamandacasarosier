-- =============================================================================
-- Migration 006: Auto-crear perfil al registrarse
-- =============================================================================
-- Crea un trigger que inserta automáticamente un registro en public.profiles
-- cuando un nuevo usuario se registra en Supabase Auth.
--
-- Primer usuario → role = 'admin'
-- Usuarios posteriores → role = 'editor'
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(new.email),
    split_part(new.email, '@', 1),
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'editor' end
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
