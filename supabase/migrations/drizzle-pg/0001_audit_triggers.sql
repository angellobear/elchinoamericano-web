CREATE OR REPLACE FUNCTION public.audit_row_pk(row_data jsonb, pk_columns text[])
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  pk_json jsonb := '{}'::jsonb;
  pk_col text;
BEGIN
  IF row_data IS NULL OR pk_columns IS NULL OR array_length(pk_columns, 1) IS NULL THEN
    RETURN NULL;
  END IF;

  FOREACH pk_col IN ARRAY pk_columns LOOP
    pk_json := pk_json || jsonb_build_object(pk_col, row_data -> pk_col);
  END LOOP;

  IF jsonb_object_length(pk_json) = 0 THEN
    RETURN NULL;
  END IF;

  IF array_length(pk_columns, 1) = 1 THEN
    RETURN COALESCE(pk_json ->> pk_columns[1], pk_json::text);
  END IF;

  RETURN pk_json::text;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actor_id text := NULLIF(current_setting('app.audit_user_id', true), '');
  skip_audit text := current_setting('app.audit_skip', true);
  old_row jsonb;
  new_row jsonb;
  record_pk text;
BEGIN
  IF TG_TABLE_NAME = 'audit_log' OR COALESCE(skip_audit, '0') = '1' THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  IF TG_OP = 'INSERT' THEN
    new_row := to_jsonb(NEW);
    record_pk := public.audit_row_pk(new_row, TG_ARGV);

    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (actor_id, 'CREATE', TG_TABLE_NAME, record_pk, NULL, new_row::text);

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_row := to_jsonb(OLD);
    new_row := to_jsonb(NEW);

    IF old_row IS NOT DISTINCT FROM new_row THEN
      RETURN NEW;
    END IF;

    record_pk := COALESCE(
      public.audit_row_pk(new_row, TG_ARGV),
      public.audit_row_pk(old_row, TG_ARGV)
    );

    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (actor_id, 'UPDATE', TG_TABLE_NAME, record_pk, old_row::text, new_row::text);

    RETURN NEW;
  END IF;

  old_row := to_jsonb(OLD);
  record_pk := public.audit_row_pk(old_row, TG_ARGV);

  INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (actor_id, 'DELETE', TG_TABLE_NAME, record_pk, old_row::text, NULL);

  RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.refresh_audit_triggers()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  row record;
BEGIN
  FOR row IN
    SELECT
      ns.nspname AS schema_name,
      cls.relname AS table_name,
      COALESCE(pk.pk_args, '') AS pk_args
    FROM pg_class cls
    JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    LEFT JOIN LATERAL (
      SELECT string_agg(format('%L', attr.attname), ', ' ORDER BY keys.ordinality) AS pk_args
      FROM pg_index idx
      JOIN LATERAL unnest(idx.indkey) WITH ORDINALITY AS keys(attnum, ordinality) ON true
      JOIN pg_attribute attr
        ON attr.attrelid = cls.oid
       AND attr.attnum = keys.attnum
      WHERE idx.indrelid = cls.oid
        AND idx.indisprimary
    ) pk ON true
    WHERE cls.relkind = 'r'
      AND ns.nspname = 'public'
      AND cls.relname NOT IN ('audit_log', '__drizzle_migrations')
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON %I.%I',
      'audit_trigger_' || row.table_name,
      row.schema_name,
      row.table_name
    );

    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION public.write_audit_log(%s)',
      'audit_trigger_' || row.table_name,
      row.schema_name,
      row.table_name,
      row.pk_args
    );
  END LOOP;
END;
$$;
--> statement-breakpoint
SELECT public.refresh_audit_triggers();
