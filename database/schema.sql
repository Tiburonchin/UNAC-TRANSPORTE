-- Supabase Schema for Movilidad UNAC

-- 1. Enable UUID Extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- LIMPIEZA PREVIA: Ejecutar esto borra las tablas previamente creadas con este mismo nombre (y sus datos).
-- Si tienes datos importantes, ten cuidado. Si es una instalación fresca, adelante.
DROP TABLE IF EXISTS public.boarding_passes CASCADE;
DROP TABLE IF EXISTS public.daily_requests CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.stops CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;
DROP TABLE IF EXISTS public.score_tracking CASCADE;
DROP TABLE IF EXISTS public.academic_records CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;

-- 2. CREATE TABLES

-- student_profiles
CREATE TABLE public.student_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    edad INTEGER CHECK (edad >= 15 AND edad <= 80),
    genero TEXT CHECK (genero IN ('Femenino', 'Masculino', 'Prefiero no decirlo')),
    disability_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- academic_records
CREATE TABLE public.academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    semester TEXT NOT NULL,
    facultad TEXT NOT NULL,
    file_ponderado TEXT NOT NULL,
    file_matricula TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- score_tracking
CREATE TABLE public.score_tracking (
    student_id UUID PRIMARY KEY REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    base_score NUMERIC(5,2) DEFAULT 0.0,
    bonus_score NUMERIC(5,2) DEFAULT 0.0,
    total_score NUMERIC(5,2) DEFAULT 0.0,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- routes
CREATE TABLE public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- stops
CREATE TABLE public.stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    priority_weight INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- schedules
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    direction TEXT CHECK (direction IN ('Ida', 'Retorno')),
    time TIME NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_requests
CREATE TABLE public.daily_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE RESTRICT,
    stop_id UUID REFERENCES public.stops(id) ON DELETE RESTRICT,
    request_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'canceled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restringir que un alumno no pida doble reserva para el mismo horario el mismo dia
ALTER TABLE public.daily_requests ADD CONSTRAINT unique_daily_request UNIQUE (student_id, schedule_id, request_date);

-- boarding_passes
CREATE TABLE public.boarding_passes (
    request_id UUID PRIMARY KEY REFERENCES public.daily_requests(id) ON DELETE CASCADE,
    qr_hash TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'boarded', 'no_show')),
    scanned_at TIMESTAMPTZ
);

-- 3. INITIAL RLS (Row Level Security) POLICIES
-- Habilitar RLS para seguridad
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boarding_passes ENABLE ROW LEVEL SECURITY;

-- Lectura pública para elementos fijos (Rutas, Paraderos, Horarios)
CREATE POLICY "Public routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Public stops" ON public.stops FOR SELECT USING (true);
CREATE POLICY "Public schedules" ON public.schedules FOR SELECT USING (true);

-- Perfiles de estudiantes
CREATE POLICY "Usuarios pueden insertar su propio perfil" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuarios solo pueden ver su perfil" ON public.student_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.student_profiles FOR UPDATE USING (auth.uid() = id);

-- Registros académicos
CREATE POLICY "Usuarios pueden subir sus registros" ON public.academic_records FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Usuarios pueden ver sus propios registros" ON public.academic_records FOR SELECT USING (auth.uid() = student_id);

-- Tracking de score
CREATE POLICY "Usuarios pueden consultar su score" ON public.score_tracking FOR SELECT USING (auth.uid() = student_id);
-- (Insert / Update serán manejados por roles Service Role o triggers desde la DB)

-- Peticiones diarias
CREATE POLICY "Usuarios pueden crear peticiones de viaje" ON public.daily_requests FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Usuarios pueden consultar sus solicitudes" ON public.daily_requests FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Usuarios pueden cancelar o cambiar status" ON public.daily_requests FOR UPDATE USING (auth.uid() = student_id);

-- Pases de abordar
CREATE POLICY "Usuarios pueden ver sus propios pases generados" ON public.boarding_passes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.daily_requests WHERE public.daily_requests.id = request_id AND public.daily_requests.student_id = auth.uid())
);
