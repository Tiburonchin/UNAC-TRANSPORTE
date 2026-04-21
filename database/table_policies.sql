-- ==============================================================================
-- FIX ROW LEVEL SECURITY (RLS) PARA student_profiles y academic_records
-- ==============================================================================
-- El error "new row violates row-level security policy" ocurre porque faltan
-- polìticas que autoricen específicamente realizar operaciones INSERT / UPDATE
-- en las tablas mencionadas.

-- 1. Habilitar RLS si no está habilitado (por precaución)
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'student_profiles'
-- A. Permitir INSERT a su propio perfil (id = uid actual)
DROP POLICY IF EXISTS "Usuarios pueden insertar su perfil" ON public.student_profiles;
CREATE POLICY "Usuarios pueden insertar su perfil"
ON public.student_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- B. Permitir UPDATE a su propio perfil
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON public.student_profiles;
CREATE POLICY "Usuarios pueden actualizar su perfil"
ON public.student_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- C. Permitir SELECT a su propio perfil
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.student_profiles;
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON public.student_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());


-- 3. Políticas para 'academic_records'
-- A. Permitir INSERT a records (student_id = uid actual)
DROP POLICY IF EXISTS "Usuarios pueden insertar su record academico" ON public.academic_records;
CREATE POLICY "Usuarios pueden insertar su record academico"
ON public.academic_records FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- B. Permitir SELECT a records
DROP POLICY IF EXISTS "Usuarios pueden ver su record academico" ON public.academic_records;
CREATE POLICY "Usuarios pueden ver su record academico"
ON public.academic_records FOR SELECT
TO authenticated
USING (student_id = auth.uid());
