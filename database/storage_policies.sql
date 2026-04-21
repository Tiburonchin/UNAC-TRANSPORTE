-- ==========================================
-- CONFIGURACIÓN DE STORAGE PARA UNAC-TRANSPORTE
-- ==========================================

-- 1. CREACIÓN DEL BUCKET (Si no existe)
-- Nota: También puedes crearlo desde el panel de Supabase -> Storage -> New Bucket (Nombre: documents, Public: No)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'documents', 'documents', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- 2. HABILITAR RLS (Suele estar habilitado por defecto en storage.objects)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACCESO

-- A. PERMITIR SUBIDA (INSERT)
-- Los usuarios solo pueden subir archivos a una carpeta que empiece con 'user_[SU_UUID]'
CREATE POLICY "Usuarios pueden subir a su propia carpeta"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = 'user_' || auth.uid()::text
);

-- B. PERMITIR LECTURA (SELECT)
-- Los usuarios solo pueden ver archivos de su propia carpeta
CREATE POLICY "Usuarios pueden ver sus propios archivos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = 'user_' || auth.uid()::text
);

-- C. PERMITIR ACTUALIZACIÓN (UPDATE)
-- Útil si el usuario decide resubir un archivo con el mismo nombre
CREATE POLICY "Usuarios pueden actualizar sus propios archivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = 'user_' || auth.uid()::text
);

-- D. PERMITIR BORRADO (DELETE)
CREATE POLICY "Usuarios pueden borrar sus propios archivos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = 'user_' || auth.uid()::text
);
