-- Clean up role_permissions: only keep rows where allowed = true
-- This minimizes storage and assumes missing = false in app logic

-- First, delete all false entries
delete from public.role_permissions
where allowed = false;

-- Add constraint to prevent future false entries
alter table public.role_permissions
add constraint check_allowed_true
check (allowed = true);

-- Optional: create unique constraint to prevent duplicates
alter table public.role_permissions
add constraint unique_role_permission
unique (role_id, permission);

-- Verify the result
select
  r.name as role_name,
  count(rp.permission) as granted_permissions
from public.roles r
left join public.role_permissions rp on rp.role_id = r.id
group by r.id, r.name
order by r.name;
