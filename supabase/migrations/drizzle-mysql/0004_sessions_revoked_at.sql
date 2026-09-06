-- Marca de revocación de sesiones como epoch en SEGUNDOS, no como TIMESTAMP.
-- Un TIMESTAMP se interpretaría con la zona horaria de la sesión MySQL y se
-- convertiría a Date con la del proceso Node; cualquier desfase entre ambas
-- desplazaría la comparación contra el claim `iat` del JWT y la revocación
-- dejaría de revocar en silencio. Un entero no tiene semántica de zona horaria.
ALTER TABLE `users` ADD COLUMN `sessions_revoked_at` BIGINT NULL;
