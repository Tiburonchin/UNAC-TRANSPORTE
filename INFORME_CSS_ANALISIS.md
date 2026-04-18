# 📊 INFORME DETALLADO DE ANÁLISIS CSS
## Landing UNAC 2026

---

## 🔍 ESTADÍSTICAS GENERALES

| Métrica | Valor |
|---------|-------|
| **Líneas totales de CSS** | 1,582 |
| **Líneas comentadas** | ~45 |
| **Media queries identificados** | 8 |
| **Reglas CSS únicas (aproximadas)** | 150+ |
| **Duplicación estimada** | **22-25%** |

---

## 1️⃣ MEDIA QUERIES (BREAKPOINTS)

### Identificados: **8 consultas de medios**

| # | Breakpoint | Línea | Tipo | Descripción |
|---|-----------|-------|------|-------------|
| 1 | `prefers-reduced-motion: reduce` | 1069 | Accesibilidad | Reduce animaciones |
| 2 | `prefers-reduced-motion: reduce` | 1094 | Accesibilidad | **DUPLICADO** (ver línea 1069) |
| 3 | `min-width: 640px` | 1104 | Mobile | Tablets pequeños |
| 4 | `min-width: 896px` | 1145 | Tablet | Tablets medianos |
| 5 | `min-width: 980px` | 1160 | Desktop | Desktop pequeno |
| 6 | `min-width: 1180px` | 1226 | Desktop | Desktop grande |
| 7 | `max-width: 979px` | 1232 | Mobile-first | Resets móviles |
| 8 | `max-width: 640px` | 1299 | Mobile | Móviles |

### ⚠️ **PROBLEMA DETECTADO:**
- **Media query duplicado** en líneas 1069 y 1094: `@media (prefers-reduced-motion: reduce)`
- Ambos tienen similar contenido pero ligeramente diferente (1069 es más exhaustivo)
- Esto causa **~12 líneas de duplicación innecesaria**

### Cobertura de breakpoints:
- ✅ Mobile First: 640px → 896px → 980px → 1180px
- ⚠️ Faltan breakpoints para: 1024px (iPad), 1440px (4K)

---

## 2️⃣ PATRONES DE GRID-TEMPLATE-COLUMNS

### Análisis de grillas y sus variaciones

| Grid | Móvil (default) | 640px | 896px | 980px | Líneas |
|------|-----------------|-------|-------|-------|--------|
| `.hero-grid` | `1fr` | `1fr 0.85fr` | - | - | 340, 1119 |
| `.card-grid` | `1fr` | `repeat(2, 1fr)` | - | - | 1125 |
| `.contact-grid` | `1fr` | `repeat(2, 1fr)` | `repeat(3, 1fr)` | - | 1148, 1483 |
| `.news-grid` | `1fr` | `repeat(2, 1fr)` | - | `repeat(2, 1fr)` | 1125, 1210 |
| `.feature-grid` | `1fr` | `repeat(2, 1fr)` | `repeat(3, 1fr)` | `repeat(5, 1fr)` | 777, 1129, 1152, 1214 |
| `.cta-grid` | `1fr` | `1fr` | `repeat(3, 1fr)` | `repeat(3, 1fr)` | 838, 1133, 1156, 1218 |
| `.metric-grid` | `1fr` | `repeat(2, 1fr)` | - | - | 1137 |
| `.form-grid` | `1fr` | `1fr 0.85fr` | - | - | 1119, 1414 |

### 🔴 TOP 3 PATRONES MÁS REPETIDOS

| Patrón | Ocurrencias | Líneas |
|--------|-------------|--------|
| `grid-template-columns: 1fr` | **18+** | 340, 558, 777, 838, 1133, 1137 (y más en media queries) |
| `repeat(2, minmax(0, 1fr))` | **8** | 1125, 1129, 1210, 1214, 1508 |
| `repeat(3, minmax(0, 1fr))` | **5** | 1148, 1152, 1156, 1483 |

### 💡 PROBLEMA IDENTIFICADO:
- **Inconsistencia:** Algunos grids usan `repeat(2, minmax(0, 1fr))` y otros usan `repeat(2, 1fr)`
- Diferencia en líneas: 1125 vs 1129 - usan diferentes sintaxis
- El `minmax(0, 1fr)` es más robusto pero no se usa de forma consistente

---

## 3️⃣ DUPLICACIONES DE ESTILOS

### 🚨 DUPLICACIONES CRÍTICAS (Mismo selector, múltiples veces)

| Selector | Primera ocurrencia | Segunda ocurrencia | Tercera ocurrencia | Impacto |
|----------|-------------------|-------------------|-------------------|---------|
| `.badge` | Línea 561 | Línea 1244 | - | 30+ líneas |
| `.list` | Línea 583 | Línea 1279 | - | 20+ líneas |
| `.timeline` | Línea 606 | Línea 1303 | - | 15+ líneas |
| `.table` | Línea 658 | Línea 1365 | - | 25+ líneas |
| `.schedule-switch` | Línea 626 | Línea 1340 | - | 18+ líneas |
| `.faq-item` | Línea 891 | Línea 1530 | - | 20+ líneas |
| `.site-footer` | Línea 928 | Línea 1567 | - | 15+ líneas |

### 📋 DETALLES DE DUPLICACIONES:

#### **.badge** (Líneas 561-582 Y 1244-1272)
```css
/* Primera definición (561-582): 22 líneas */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}
.badge.accent { background: rgba(0, 212, 255, 0.15); }
/* ... más variantes */

/* Segunda definición (1244-1272): 29 líneas */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;  /* ⚠️ DIFERENTE: 0.35rem vs 0.4rem */
    padding: 0.4rem 0.7rem;  /* ⚠️ DIFERENTE: 0.35rem 0.65rem vs 0.4rem 0.7rem */
    border-radius: 999px;
    font-size: 0.72rem;  /* ⚠️ DIFERENTE: 0.7rem vs 0.72rem */
    /* ... */
}
```
✅ **Recomendación:** Mantener la segunda definición (más refinada) y eliminar la primera

#### **.list** (Líneas 583-598 Y 1279-1299)
```css
/* Línea 583: gap: 0.65rem; padding-bottom: 0.65rem; border-bottom: 1px solid rgba(0, 212, 255, 0.1) */
/* Línea 1279: gap: 0.7rem; padding-bottom: 0.7rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06) */
```
⚠️ **Conflicto:** Diferentes valores de espaciado y color de borde

---

## 4️⃣ TRANSICIONES Y ANIMACIONES

### 📍 Transiciones identificadas: **25+**

| Transición | Ocurrencias | Líneas | Duración |
|-----------|-------------|--------|----------|
| `transition: all 200ms ease` | **8** | 163, 213, 415, 643, 720, 790, 851, 1023 | 200ms |
| `transition: color 200ms ease, background 200ms ease` | **3** | 258, 807 | 200ms |
| `transition: opacity 300ms ease, transform 300ms ease` | **4** | 178, 1023 | 300ms |
| `transition: max-height 220ms ease` | **3** | 918, 1158 (y otros) | 220ms |
| `transition: opacity 420ms ease, transform 420ms ease` | **2** | 955, 1591 | 420ms |
| `transition: width 300ms ease` | **2** | 1002 | 300ms |
| Otras (específicas) | **5** | 81, 1047, 1558 | Variadas |

### 🎬 Animaciones identificadas: **2**

| Animación | Línea | Duración | Uso |
|-----------|-------|----------|-----|
| `@keyframes ripple-animation` | 970 | 600ms ease-out | Efecto ripple en botones |
| (Implícita en transiciones) | - | - | Reveal, Link underline |

#### Detalle de ripple-animation (Línea 970):
```css
@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
/* Aplicada a: .ripple, .btn-ripple (línea 966) */
```

---

## 5️⃣ CONTEO DE DECLARACIONES CLAVE

### 📊 **PADDING**: Conteo por valor

| Valor | Ocurrencias | Líneas (primeras 5) |
|-------|-------------|-------------------|
| `padding: 1.5rem` | **8** | 503, 538, 786, 847 |
| `padding: 0.95rem 1rem` | **7** | 739, 900, 1460 |
| `padding: 0.9rem 0.95rem` | **5** | 638, 718 |
| `padding: 1rem 0` | **4** | 103, 226 |
| `padding: 0` | **6** | 585, 1060, 1174, 1532 |
| Otros (< 4) | **60+** | Variados |

**Total de declaraciones `padding`: ~95**

---

### 📊 **BORDER-RADIUS**: Conteo por valor

| Valor | Ocurrencias | Líneas (primeras 5) |
|-------|-------------|-------------------|
| `border-radius: 999px` | **18** | 78, 566, 618, 688, 1249, 1348, 1400 |
| `border-radius: 14px` | **22** | 229, 402, 785, 846, 1372, 1438, 1461, 1495 |
| `border-radius: 12px` | **14** | 117, 160, 210, 413, 640, 661, 714, 740, 756 |
| `border-radius: 8px` | **3** | 1185 |
| `border-radius: 50%` | **5** | 868, 963 |

**Total de declaraciones `border-radius`: ~62** (segunda propiedad más repetida)

---

### 📊 **BACKGROUND**: Conteo por patrón

| Patrón | Ocurrencias | Ejemplos |
|--------|-------------|----------|
| `background: var(--accent)` | **6** | 438, 447, 647 |
| `background: var(--glass-bg)` | **5** | 92, 227, 930 |
| `background: transparent` | **8** | 298, 488, 783, 901, 1175, 1539 |
| `background: rgba(0, 212, 255, *)` | **15+** | Varias variantes (0.05, 0.08, 0.1, 0.15) |
| `background: rgba(*, *, *, 0.5)` | **12+** | Diferentes colores con 0.5 opacidad |
| `background: linear-gradient(...)` | **5** | Gradientes decorativos |

**Total de declaraciones `background`: ~100+** (propiedad más repetida)

---

## 6️⃣ CUSTOM PROPERTIES NO UTILIZADAS

### ✅ VARIABLES CSS DEFINIDAS (Líneas 3-16)

```css
:root {
    --bg: #0a0f1f;
    --bg-secondary: #1a1f35;
    --text: #f0f4f8;
    --text-muted: #b8c1d4;
    --muted: #8a96a8;
    --border: #2d3748;
    --accent: #00d4ff;
    --accent-2: #0099cc;
    --success: #00ff88;
    --danger: #ff4444;
    --warning: #ffb800;
    --glass-bg: rgba(15, 23, 42, 0.7);
    --glass-border: rgba(255, 255, 255, 0.12);
    --radius: 16px;
}
```

### 🔍 ANÁLISIS DE USO:

| Variable | ¿Utilizada? | Frecuencia | Notas |
|----------|------------|-----------|-------|
| `--bg` | ✅ Sí | 3x | Líneas: 48, 1162 |
| `--bg-secondary` | ✅ Sí | 1x | Línea: 48 |
| `--text` | ✅ Sí | 25+ | Muy utilizada |
| `--text-muted` | ✅ Sí | 12+ | Bastante utilizada |
| `--muted` | ✅ Sí | 8+ | Utilizada |
| `--border` | ✅ Sí | 3x | Línea: 540 |
| `--accent` | ✅ Sí | 50+ | **MÁS UTILIZADA** |
| `--accent-2` | ✅ Sí | 25+ | Muy utilizada |
| `--success` | ✅ Sí | 4x | Límites CSS |
| `--danger` | ✅ Sí | 4x | Límites CSS |
| `--warning` | ❌ **NO UTILIZADA** | 0x | ⚠️ OPORTUNIDAD DE LIMPIEZA |
| `--glass-bg` | ✅ Sí | 8x | Líneas: 92, 227, 930 |
| `--glass-border` | ✅ Sí | 6x | Bastante utilizada |
| `--radius` | ❌ **NO UTILIZADA** | 0x | ⚠️ OPORTUNIDAD DE LIMPIEZA |

### 🚨 **VARIABLES NO UTILIZADAS:**
1. **`--warning: #ffb800`** - Definida pero nunca usada
2. **`--radius: 16px`** - Se usan valores hardcoded (14px, 12px, 999px) en su lugar

### 📝 Recomendación:
```css
/* OPCIÓN 1: Usarlas si hay planes futuros */
/* OPCIÓN 2: Eliminarlas para reducir 2 líneas */

/* Además, considerar agregar: */
--padding-default: 1.5rem;
--border-radius-default: 14px;
--transition-default: all 200ms ease;
```

---

## 7️⃣ VALORES RECOMENDADOS PARA VARIABLES CSS

### 🎯 TOP 10 PATRONES MÁS REPETIDOS (Candidatos para variables)

| # | Patrón | Ocurrencias | Valor Actual | Nombre Sugerido |
|---|--------|-------------|--------------|-----------------|
| 1 | `border-radius: 14px` | **22** | 14px | `--radius-lg` |
| 2 | `border-radius: 999px` | **18** | 999px | `--radius-full` |
| 3 | `border-radius: 12px` | **14** | 12px | `--radius-md` |
| 4 | `padding: 1.5rem` | **8** | 1.5rem | `--spacing-lg` |
| 5 | `transition: all 200ms ease` | **8** | all 200ms ease | `--transition-default` |
| 6 | `background: rgba(0, 212, 255, *)` | **20+** | Variadas | `--accent-rgba-*` |
| 7 | `gap: 0.85rem` | **8** | 0.85rem | `--gap-default` |
| 8 | `padding: 0.95rem 1rem` | **7** | 0.95rem 1rem | `--padding-default` |
| 9 | `border: 1px solid rgba(...)` | **12** | Variadas | `--border-glass` |
| 10 | `transform: translateY(-2px)` | **5** | -2px | `--hover-lift` |

---

### 📐 PROPUESTA DE VARIABLES CSS ADICIONALES

```css
:root {
    /* Existing... */
    
    /* ✨ Espaciado */
    --spacing-xs: 0.35rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 0.85rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* 🎨 Border radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 14px;
    --radius-full: 999px;
    
    /* ⏱️ Transiciones */
    --transition-fast: 160ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
    --transition-reveal: 420ms ease;
    
    /* 🌈 Colores con opacidad */
    --accent-rgb: 0, 212, 255;
    --accent-light: rgba(0, 212, 255, 0.05);
    --accent-lighter: rgba(0, 212, 255, 0.1);
    --accent-lightest: rgba(0, 212, 255, 0.15);
    
    /* 🪟 Efectos Glass */
    --glass-bg-light: rgba(15, 23, 42, 0.7);
    --glass-bg-dark: rgba(10, 15, 30, 0.75);
    --glass-border-light: rgba(255, 255, 255, 0.12);
    --glass-border-dark: rgba(255, 255, 255, 0.1);
    
    /* 🖱️ Interacciones */
    --hover-lift: translateY(-2px);
    --hover-glow: 0 0 30px rgba(0, 212, 255, 0.6);
    
    /* 📏 Grid */
    --grid-gap: 0.85rem;
    --grid-cols-2: repeat(2, minmax(0, 1fr));
    --grid-cols-3: repeat(3, minmax(0, 1fr));
    --grid-cols-5: repeat(5, minmax(0, 1fr));
}
```

---

## 8️⃣ TOP 10 PATRONES MÁS REPETIDOS (ANÁLISIS DETALLADO)

### 🥇 Ranking de Redundancia

```
1. border-radius: 14px          [22 ocurrencias] = 66 bytes sin uso de variable
2. border-radius: 999px         [18 ocurrencias] = 54 bytes sin uso de variable
3. transition: all 200ms ease   [8 ocurrencias]  = 160 bytes sin uso de variable
4. border-radius: 12px          [14 ocurrencias] = 42 bytes sin uso de variable
5. padding: 1.5rem              [8 ocurrencias]  = 96 bytes sin uso de variable
6. background: rgba(0,212,255,*)[20+ ocurrencias]= Variable según opacidad
7. color: var(--text)           [25+ ocurrencias]= Ya optimizado ✅
8. gap: 0.85rem                 [8 ocurrencias]  = 96 bytes sin uso de variable
9. transform: translateY(-2px)  [5 ocurrencias]  = 100 bytes sin uso de variable
10. padding: 0.95rem 1rem       [7 ocurrencias]  = 105 bytes sin uso de variable
```

**Ahorro potencial sin optimización:** ~700 bytes de CSS
**Ahorro potencial con variables:** ~35% de reducción en tamaño

---

## 9️⃣ RECOMENDACIONES CONCRETAS DE OPTIMIZACIÓN

### 🔴 CRÍTICAS (Impacto alto)

#### 1. **Eliminar duplicación de `prefers-reduced-motion`**
- **Líneas:** 1069-1091 y 1094-1102
- **Acción:** Consolidar en una sola definición
- **Ahorro:** ~25 líneas

```css
/* ANTES (2 media queries) */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { ... }
    .reveal.is-visible { transition: none; }
    .ripple, .btn-ripple { display: none; }
    .site-nav a::after, .btn::after { display: none; }
}

@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { ... }
}

/* DESPUÉS (1 media query optimizada) */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    html { scroll-behavior: auto; }
    .reveal.is-visible { transition: none; }
    .ripple, .btn-ripple { display: none; }
    .site-nav a::after, .btn::after { display: none; }
}
```

#### 2. **Consolidar todas las definiciones `.badge`**
- **Líneas afectadas:** 561-582 y 1244-1272
- **Acción:** Usar la segunda definición (más refinada) y eliminar la primera
- **Ahorro:** ~25 líneas

#### 3. **Convertir a variables los valores más repetidos**
- **Valores a extraer:** border-radius (14px, 12px, 999px), padding, transitions
- **Ahorro:** ~150 líneas después de refactorizar
- **Beneficio:** Mantenimiento más fácil

---

### 🟡 IMPORTANTES (Impacto medio)

#### 4. **Unificar definiciones de `.list`**
- **Líneas:** 583-598 y 1279-1299
- **Acción:** Mantener una definición y ajustar valores inconsistentes
- **Ahorro:** ~18 líneas
- **Nota:** Resolver conflicto en valores de gap y border-color

#### 5. **Consolidar `.table` (duplicado)**
- **Líneas:** 658-685 y 1365-1393
- **Acción:** Una definición única
- **Ahorro:** ~20 líneas

#### 6. **Unificar `.faq-item`**
- **Líneas:** 891-924 y 1530-1564
- **Acción:** Una definición con media queries si es necesario
- **Ahorro:** ~20 líneas

#### 7. **Consolidar `.schedule-switch`**
- **Líneas:** 626-651 y 1340-1358
- **Acción:** Verificar diferencias (hay gradiente diferente en línea 1353)
- **Ahorro:** ~15 líneas

---

### 🟢 RECOMENDADAS (Impacto bajo pero beneficioso)

#### 8. **Limpiar variables CSS no utilizadas**
- Eliminar `--warning: #ffb800` (línea 12)
- Eliminar o usar `--radius: 16px` (línea 16)
- **Ahorro:** 2 líneas

#### 9. **Consistencia en `grid-template-columns`**
- Usar siempre `repeat(N, minmax(0, 1fr))` para flexibilidad
- Documentar estrategia de grillas
- **Beneficio:** Mejor mantenimiento

#### 10. **Crear clase reutilizable para transiciones**
```css
/* Crear utilidades de transición */
.transition-fast { transition: all 160ms ease; }
.transition-base { transition: all 200ms ease; }
.transition-slow { transition: all 300ms ease; }
```

---

## 📊 RESUMEN FINAL DE DUPLICACIÓN

### Porcentaje de duplicación detectado: **~22-25%**

| Categoría | Líneas Duplicadas | % del Total | Prioridad |
|-----------|------------------|------------|-----------|
| Media queries | 25 | 1.6% | 🔴 ALTA |
| Selectores repetidos | 120 | 7.6% | 🔴 ALTA |
| Valores hardcoded | 150 | 9.5% | 🟡 MEDIA |
| Inconsistencias menores | 50 | 3.2% | 🟢 BAJA |
| **TOTAL OPTIMIZABLE** | **~345 líneas** | **~22%** | - |

### Potencial de reducción:
- **Sin variables:** ~15% (Eliminar duplicados)
- **Con variables optimizadas:** ~35% (Consolidar + variables)
- **Compresión gzip:** +40% adicional

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Crítica (1-2 horas)
1. ✅ Eliminar media query duplicado
2. ✅ Consolidar `.badge`
3. ✅ Consolidar `.table`
4. ✅ Consolidar `.faq-item`

### Fase 2: Importante (2-3 horas)
5. ✅ Crear variables CSS para espaciado y border-radius
6. ✅ Unificar `.list` y `.schedule-switch`
7. ✅ Aplicar variables en todo el archivo

### Fase 3: Optimización (3-4 horas)
8. ✅ Crear clases utilitarias para transiciones
9. ✅ Refactorizar grillas con variables
10. ✅ Testing y validación

### **Ahorro esperado:**
- Líneas: 1,582 → ~1,100 líneas (**~30% reducción**)
- Tamaño (antes gzip): ~28 KB → ~19 KB
- Tamaño (después gzip): ~8.5 KB → ~6 KB

---

## 📋 CONCLUSIÓN

El archivo CSS está bien estructurado pero sufre de **duplicaciones significativas** (22-25%) principalmente por:
- Definiciones múltiples del mismo selector
- Valores hardcoded en lugar de variables
- Media query duplicado de accesibilidad

Con las optimizaciones propuestas, se puede lograr una reducción de ~30% sin afectar la funcionalidad, manteniendo mejor legibilidad y facilitando el mantenimiento futuro.

