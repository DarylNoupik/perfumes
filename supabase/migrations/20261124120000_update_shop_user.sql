-- Modification d'un utilisateur depuis l'onglet Utilisateurs du dashboard.
-- Réservé aux admins. Le rôle vit dans app_metadata (lu par les policies via
-- le JWT), le nom et le téléphone dans user_metadata.
-- Le nouveau rôle s'applique à la prochaine actualisation de session de
-- l'utilisateur concerné (reconnexion, ou au plus tard à l'expiration du jeton).
create function public.update_shop_user(user_ref uuid, new_name text, new_phone text, new_role text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;
  if new_role is null or new_role not in ('client', 'vendor', 'admin') then
    raise exception 'Rôle inconnu' using errcode = '22023';
  end if;
  if nullif(trim(new_name), '') is null then
    raise exception 'Le nom est obligatoire' using errcode = '22023';
  end if;
  -- Un admin ne peut pas se retirer lui-même ses droits (évite de se bloquer)
  if user_ref = auth.uid() and new_role <> 'admin' then
    raise exception 'Tu ne peux pas retirer ton propre rôle admin' using errcode = '42501';
  end if;

  update auth.users set
    raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new_role),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('name', trim(new_name), 'phone', coalesce(trim(new_phone), ''))
  where id = user_ref;
  if not found then
    raise exception 'Utilisateur introuvable' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_shop_user(uuid, text, text, text) from public, anon;
grant execute on function public.update_shop_user(uuid, text, text, text) to authenticated;
