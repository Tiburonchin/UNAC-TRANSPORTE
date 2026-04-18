# Supabase Setup (Auth + Perfil + Storage Privado)

## 1) Configurar Auth Google

1. En Supabase, activa `Google` en Authentication > Providers.
2. Agrega Redirect URL de produccion:
   - `https://<tu-usuario>.github.io/<repo>/landing-unac/index.html`
3. Agrega Redirect URL local (opcional):
   - `http://localhost/.../landing-unac/index.html`

## 2) Configurar variables del frontend

Edita `assets/js/supabase-config.js` con tu proyecto real:

- `url`
- `anonKey`
- `redirectTo`
- `allowedEmailDomain` (`unac.edu.pe`)
- `profileTable` (`student_profiles`)
- `privateBucket` (`student-documents`)

## 3) Crear tabla de perfiles

```sql
create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  dni text not null,
  facultad text not null,
  horario text not null,
  document_path text,
  updated_at timestamptz default now()
);

alter table public.student_profiles enable row level security;

create policy "select own profile"
on public.student_profiles
for select
using (auth.uid() = user_id);

create policy "insert own profile"
on public.student_profiles
for insert
with check (auth.uid() = user_id);

create policy "update own profile"
on public.student_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## 4) Crear bucket privado de documentos

1. Crea bucket `student-documents` con visibilidad `private`.
2. Agrega politicas SQL:

```sql
create policy "read own files"
on storage.objects
for select
using (
  bucket_id = 'student-documents'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "insert own files"
on storage.objects
for insert
with check (
  bucket_id = 'student-documents'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "update own files"
on storage.objects
for update
using (
  bucket_id = 'student-documents'
  and auth.uid()::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'student-documents'
  and auth.uid()::text = split_part(name, '/', 1)
);
```

## 5) Restriccion por dominio institucional

El frontend bloquea cualquier cuenta que no termine en `@unac.edu.pe` y cierra sesion automaticamente.

Recomendacion adicional: en Google OAuth consent/app, limita a dominio institucional cuando sea posible en tu configuracion de Google Cloud.
