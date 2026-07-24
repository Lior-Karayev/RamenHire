select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'companies'::regclass and contype = 'c';