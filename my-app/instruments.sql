begin;

create table if not exists public.instruments (
  id bigint generated always as identity primary key,
  name text not null
);

alter table public.instruments enable row level security;
grant select on public.instruments to anon;

drop policy if exists "public can read instruments" on public.instruments;
create policy "public can read instruments"
  on public.instruments for select to anon
  using (true);

insert into public.instruments (name)
select sample.name
from (values ('violin'), ('viola'), ('cello')) as sample(name)
where not exists (
  select 1 from public.instruments as existing where existing.name = sample.name
);

commit;
