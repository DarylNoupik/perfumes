create function public.import_shop_history(references_data jsonb, sales_data jsonb) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  references_count integer;
  sales_count integer;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Accès administrateur requis' using errcode = '42501';
  end if;
  insert into public.product_tracking(product_id, code, audience, purchase_price, fees, opening_stock)
  select r.product_id, nullif(r.code, ''), r.audience, r.purchase_price, r.fees, r.opening_stock
  from jsonb_to_recordset(references_data) as r(
    product_id bigint, code text, audience text, purchase_price integer, fees integer, opening_stock integer
  )
  on conflict (product_id) do nothing;
  get diagnostics references_count = row_count;
  insert into public.stock_movements(
    source_key, kind, product_id, product_name, product_code, audience, occurred_on,
    quantity, planned_price, unit_price, unit_cost, price_from_plan, note
  )
  select s.source_key, 'sale', s.product_id, s.product_name, s.product_code, s.audience, s.occurred_on,
    s.quantity, s.planned_price, s.unit_price, s.unit_cost, s.price_from_plan, 'Historique Excel'
  from jsonb_to_recordset(sales_data) as s(
    source_key text, product_id bigint, product_name text, product_code text, audience text, occurred_on date,
    quantity integer, planned_price integer, unit_price integer, unit_cost integer, price_from_plan boolean
  )
  on conflict (source_key) do nothing;
  get diagnostics sales_count = row_count;
  return jsonb_build_object('count', sales_count, 'updatedReferences', references_count);
end;
$$;

revoke all on function public.import_shop_history(jsonb, jsonb) from public, anon;
grant execute on function public.import_shop_history(jsonb, jsonb) to authenticated;

create function public.adjust_shop_stock(product_ref bigint, delta integer) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  if delta is null or delta not in (-1, 1) then
    raise exception 'Ajustement invalide' using errcode = '22023';
  end if;
  update public.products set stock = stock + delta
  where id = product_ref and stock + delta >= 0;
  if not found then raise exception 'Ajustement impossible' using errcode = '22023'; end if;
end;
$$;

revoke all on function public.adjust_shop_stock(bigint, integer) from public, anon;
grant execute on function public.adjust_shop_stock(bigint, integer) to authenticated;
