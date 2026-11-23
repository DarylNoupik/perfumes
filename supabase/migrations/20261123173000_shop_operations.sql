alter table public.stock_movements
  add column price_from_plan boolean not null default false;

alter table public.orders
  add column installment_plan jsonb,
  add column checkout_key uuid unique;

create table public.shop_settings (
  id integer primary key check (id = 1),
  storefront jsonb not null default '{}',
  low_stock_threshold integer not null default 1 check (low_stock_threshold >= 0)
);

insert into public.shop_settings (id) values (1);
alter table public.shop_settings enable row level security;
revoke all on public.shop_settings from anon, authenticated;
grant select on public.shop_settings to anon, authenticated;
grant update on public.shop_settings to authenticated;
create policy shop_settings_read on public.shop_settings
  for select to anon, authenticated using (true);
create policy shop_settings_admin_update on public.shop_settings
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy products_vendor_write on public.products
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'vendor')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'vendor');

create function public.checkout_shop(
  customer_name text, customer_phone text, delivery_address text, payment_method text,
  items jsonb, request_id uuid, installments boolean
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  buyer uuid := auth.uid();
  order_ref uuid;
  config jsonb;
  min_orders integer;
  min_price integer;
  order_total bigint;
begin
  if buyer is null or request_id is null then
    raise exception 'Une connexion et une référence de commande sont requises' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(buyer::text || request_id::text, 0));
  select id into order_ref from public.orders where checkout_key = request_id and customer_id = buyer;
  if found then return order_ref; end if;

  order_ref := public.place_shop_order(customer_name, customer_phone, delivery_address, payment_method, items);
  update public.orders set checkout_key = request_id where id = order_ref;
  if installments then
    select storefront into config from public.shop_settings where id = 1;
    min_orders := greatest(2, coalesce((config ->> 'installMinOrders')::integer, 3));
    min_price := coalesce((config ->> 'installMinPrice')::integer, 50000);
    if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'client') <> 'client' or
      (select count(*) from public.orders where customer_id = buyer and status = 'livré') < min_orders or
      not exists (select 1 from public.order_items where order_id = order_ref and planned_price > min_price)
    then
      raise exception 'Cette commande ne remplit pas les critères du paiement en tranches' using errcode = '22023';
    end if;
    select sum(planned_price::bigint * quantity) into order_total from public.order_items where order_id = order_ref;
    update public.orders set installment_plan = jsonb_build_object(
      'total', order_total, 'parts', min_orders, 'perPart', (order_total + min_orders - 1) / min_orders, 'paidCount', 0
    ) where id = order_ref;
  end if;
  return order_ref;
end;
$$;

revoke execute on function public.place_shop_order(text, text, text, text, jsonb) from authenticated;
revoke all on function public.checkout_shop(text, text, text, text, jsonb, uuid, boolean) from public, anon;
grant execute on function public.checkout_shop(text, text, text, text, jsonb, uuid, boolean) to authenticated;

create function public.set_shop_order_status(order_ref uuid, next_status text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  current_status text;
  line record;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') not in ('admin', 'vendor') then
    raise exception 'Accès réservé à la boutique' using errcode = '42501';
  end if;
  if next_status is null or next_status not in ('en attente', 'en cours', 'livré', 'annulé') then
    raise exception 'Statut invalide' using errcode = '22023';
  end if;
  select status into current_status from public.orders where id = order_ref for update;
  if not found then raise exception 'Commande introuvable' using errcode = '22023'; end if;
  if next_status = current_status then return; end if;
  if current_status = 'annulé' or next_status = 'annulé' then
    for line in select product_id, quantity from public.order_items where order_id = order_ref order by product_id loop
      if next_status = 'annulé' then
        update public.products set stock = stock + line.quantity where id = line.product_id;
      else
        update public.products set stock = stock - line.quantity where id = line.product_id and stock >= line.quantity;
        if not found then raise exception 'Stock insuffisant pour rouvrir la commande' using errcode = '22023'; end if;
      end if;
    end loop;
  end if;
  update public.orders set status = next_status where id = order_ref;
end;
$$;

create function public.record_shop_movement(
  product_ref bigint, movement_kind text, movement_date date, units integer, amount integer, remark text
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  product public.products;
  info public.product_tracking;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Accès administrateur requis' using errcode = '42501';
  end if;
  if movement_kind is null or movement_kind not in ('sale', 'receipt') or movement_date is null or
    units is null or units < 1 or amount is null or amount < 0 then
    raise exception 'Mouvement invalide' using errcode = '22023';
  end if;
  update public.products
  set stock = stock + case when movement_kind = 'sale' then -units else units end
  where id = product_ref and (movement_kind = 'receipt' or stock >= units)
  returning * into product;
  if not found then raise exception 'Produit introuvable ou stock insuffisant' using errcode = '22023'; end if;
  select * into info from public.product_tracking where product_id = product_ref;
  insert into public.stock_movements(
    kind, product_id, product_name, product_code, audience, occurred_on, quantity, planned_price, unit_price, unit_cost, note
  ) values (
    movement_kind, product.id, product.name, info.code, info.audience, movement_date, units,
    case when movement_kind = 'sale' then product.price end, amount,
    case when movement_kind = 'sale' then info.purchase_price + info.fees end, coalesce(remark, '')
  );
end;
$$;

create function public.shop_users()
returns table(id uuid, name text, email text, phone text, role text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select u.id, coalesce(u.raw_user_meta_data ->> 'name', u.email), u.email::text,
    coalesce(u.raw_user_meta_data ->> 'phone', u.phone), coalesce(u.raw_app_meta_data ->> 'role', 'client'), u.created_at
  from auth.users as u where auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  order by u.created_at desc;
$$;

revoke all on function public.set_shop_order_status(uuid, text),
  public.record_shop_movement(bigint, text, date, integer, integer, text), public.shop_users() from public, anon;
grant execute on function public.set_shop_order_status(uuid, text),
  public.record_shop_movement(bigint, text, date, integer, integer, text), public.shop_users() to authenticated;
