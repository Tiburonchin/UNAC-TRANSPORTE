-- ==============================================================================
-- FIX DEFINITIVO PARA EL ERROR "NEW ROW VIOLATES ROW-LEVEL SECURITY POLICY"
-- ==============================================================================
-- El error de "Row-Level Security" al momento de *subir archivos* (storage.objects)
-- Suele ocurrir cuando la polìtica falla al extraer el array del foldername, 
-- o cuando hacen falta permisos conexos de UPDATE o SELECT.

-- 1. Aseguramos que el bucket 'documents' sea referenciado bien sin mayúsculas
-- (Si el bucket no existe en public tampoco te dejará subir, pero asumiremos que ya existe).

-- 2. Eliminamos las antiguas policies que pueden estar causando cruce
DROP POLICY IF EXISTS "Usuarios pueden subir a su propia carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden editar sus propios archivos" ON storage.objects;

-- 3. Creamos una política más robusta usando LIKE en el nombre del objeto
-- para la INSERCIÓN.
CREATE POLICY "Usuarios pueden subir a su propia carpeta de documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND 
    name LIKE 'user_' || auth.uid()::text || '/%'
);

-- 4. Política para LECTURA
CREATE POLICY "Usuarios pueden ver su propia carpeta de documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND 
    name LIKE 'user_' || auth.uid()::text || '/%'
);

-- 5. Política para EDICIÓN (A veces el upload lanza internamente pre-checks de update/upsert)
CREATE POLICY "Usuarios pueden actualizar su propia carpeta de documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents' AND 
    name LIKE 'user_' || auth.uid()::text || '/%'
)
WITH CHECK (
    bucket_id = 'documents' AND 
    name LIKE 'user_' || auth.uid()::text || '/%'
);

-- OPCIONAL: Para asegurar que la tabla en public también tiene permisos (como te envié antes)
-- Ejecuta también el table_policies.sql si no lo hiciste, ya que luego del archivo se guardan los perfiles!
