DROP PROCEDURE IF EXISTS refresh_audit_triggers;--> statement-breakpoint
CREATE PROCEDURE refresh_audit_triggers()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_table_name VARCHAR(128);
  DECLARE v_new_json LONGTEXT;
  DECLARE v_old_json LONGTEXT;
  DECLARE v_pk_count INT DEFAULT 0;
  DECLARE v_first_pk VARCHAR(128);
  DECLARE v_pk_new_pairs LONGTEXT;
  DECLARE v_pk_old_pairs LONGTEXT;
  DECLARE v_new_pk_expr LONGTEXT;
  DECLARE v_old_pk_expr LONGTEXT;

  DECLARE tables_cursor CURSOR FOR
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('audit_log', '__drizzle_migrations');

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN tables_cursor;

  audit_loop: LOOP
    FETCH tables_cursor INTO v_table_name;
    IF done = 1 THEN
      LEAVE audit_loop;
    END IF;

    SELECT GROUP_CONCAT(
      CONCAT("'", REPLACE(column_name, "'", "\\'"), "', NEW.`", REPLACE(column_name, "`", "``"), "`")
      ORDER BY ordinal_position
      SEPARATOR ', '
    )
    INTO v_new_json
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = v_table_name;

    SELECT GROUP_CONCAT(
      CONCAT("'", REPLACE(column_name, "'", "\\'"), "', OLD.`", REPLACE(column_name, "`", "``"), "`")
      ORDER BY ordinal_position
      SEPARATOR ', '
    )
    INTO v_old_json
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = v_table_name;

    SELECT COUNT(*)
    INTO v_pk_count
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = v_table_name
      AND constraint_name = 'PRIMARY';

    SELECT column_name
    INTO v_first_pk
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = v_table_name
      AND constraint_name = 'PRIMARY'
    ORDER BY ordinal_position
    LIMIT 1;

    SELECT GROUP_CONCAT(
      CONCAT("'", REPLACE(column_name, "'", "\\'"), "', NEW.`", REPLACE(column_name, "`", "``"), "`")
      ORDER BY ordinal_position
      SEPARATOR ', '
    )
    INTO v_pk_new_pairs
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = v_table_name
      AND constraint_name = 'PRIMARY';

    SELECT GROUP_CONCAT(
      CONCAT("'", REPLACE(column_name, "'", "\\'"), "', OLD.`", REPLACE(column_name, "`", "``"), "`")
      ORDER BY ordinal_position
      SEPARATOR ', '
    )
    INTO v_pk_old_pairs
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = v_table_name
      AND constraint_name = 'PRIMARY';

    IF v_pk_count = 0 THEN
      SET v_new_pk_expr = 'NULL';
      SET v_old_pk_expr = 'NULL';
    ELSEIF v_pk_count = 1 THEN
      SET v_new_pk_expr = CONCAT('CAST(NEW.`', REPLACE(v_first_pk, '`', '``'), '` AS CHAR)');
      SET v_old_pk_expr = CONCAT('CAST(OLD.`', REPLACE(v_first_pk, '`', '``'), '` AS CHAR)');
    ELSE
      SET v_new_pk_expr = CONCAT('JSON_OBJECT(', v_pk_new_pairs, ')');
      SET v_old_pk_expr = CONCAT('JSON_OBJECT(', v_pk_old_pairs, ')');
    END IF;

    SET @drop_insert_trigger = CONCAT('DROP TRIGGER IF EXISTS `audit_', v_table_name, '_ai`');
    PREPARE stmt FROM @drop_insert_trigger;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @drop_update_trigger = CONCAT('DROP TRIGGER IF EXISTS `audit_', v_table_name, '_au`');
    PREPARE stmt FROM @drop_update_trigger;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @drop_delete_trigger = CONCAT('DROP TRIGGER IF EXISTS `audit_', v_table_name, '_ad`');
    PREPARE stmt FROM @drop_delete_trigger;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @create_insert_trigger = CONCAT(
      'CREATE TRIGGER `audit_', v_table_name, '_ai` AFTER INSERT ON `', v_table_name, '` FOR EACH ROW ',
      'BEGIN ',
      'IF COALESCE(@app_audit_skip, 0) = 0 THEN ',
      'INSERT INTO `audit_log` (`user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `created_at`) ',
      'VALUES (NULLIF(@app_audit_user_id, ''''), ''CREATE'', ''', v_table_name, ''', ', v_new_pk_expr, ', NULL, JSON_OBJECT(', v_new_json, '), NOW()); ',
      'END IF; ',
      'END'
    );
    PREPARE stmt FROM @create_insert_trigger;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @create_update_trigger = CONCAT(
      'CREATE TRIGGER `audit_', v_table_name, '_au` AFTER UPDATE ON `', v_table_name, '` FOR EACH ROW ',
      'BEGIN ',
      'IF COALESCE(@app_audit_skip, 0) = 0 THEN ',
      'INSERT INTO `audit_log` (`user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `created_at`) ',
      'VALUES (NULLIF(@app_audit_user_id, ''''), ''UPDATE'', ''', v_table_name, ''', ',
      'COALESCE(', v_new_pk_expr, ', ', v_old_pk_expr, '), ',
      'JSON_OBJECT(', v_old_json, '), JSON_OBJECT(', v_new_json, '), NOW()); ',
      'END IF; ',
      'END'
    );
    PREPARE stmt FROM @create_update_trigger;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @create_delete_trigger = CONCAT(
      'CREATE TRIGGER `audit_', v_table_name, '_ad` AFTER DELETE ON `', v_table_name, '` FOR EACH ROW ',
      'BEGIN ',
      'IF COALESCE(@app_audit_skip, 0) = 0 THEN ',
      'INSERT INTO `audit_log` (`user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `created_at`) ',
      'VALUES (NULLIF(@app_audit_user_id, ''''), ''DELETE'', ''', v_table_name, ''', ', v_old_pk_expr, ', JSON_OBJECT(', v_old_json, '), NULL, NOW()); ',
      'END IF; ',
      'END'
    );
    PREPARE stmt FROM @create_delete_trigger;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;

  CLOSE tables_cursor;
END;--> statement-breakpoint
CALL refresh_audit_triggers();
