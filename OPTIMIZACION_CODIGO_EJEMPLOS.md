# 🔧 IMPLEMENTACIÓN DE OPTIMIZACIONES - Ejemplos de Código

## 1. VARIABLES CSS OPTIMIZADAS

### ✅ Propuesta de `:root` refactorizado

```css
:root {
    /* COLORES EXISTENTES */
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
    /* ❌ ELIMINAR: --warning: #ffb800; (NO USADO) */
    
    /* GLASS EFFECTS */
    --glass-bg: rgba(15, 23, 42, 0.7);
    --glass-border: rgba(255, 255, 255, 0.12);
    
    /* ✨ NUEVAS VARIABLES - ESPACIADO */
    --spacing-xs: 0.35rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 0.85rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3.5rem;
    
    /* 🎨 NUEVAS VARIABLES - BORDER RADIUS */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 14px;
    --radius-full: 999px;
    
    /* ⏱️ NUEVAS VARIABLES - TRANSICIONES */
    --transition-fast: 160ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
    --transition-reveal: 420ms ease;
    
    /* 🌈 NUEVAS VARIABLES - COLORES CON OPACIDAD */
    --accent-5: rgba(0, 212, 255, 0.05);
    --accent-8: rgba(0, 212, 255, 0.08);
    --accent-10: rgba(0, 212, 255, 0.1);
    --accent-15: rgba(0, 212, 255, 0.15);
    --accent-20: rgba(0, 212, 255, 0.2);
    
    --accent2-15: rgba(0, 153, 204, 0.15);
    --accent2-20: rgba(0, 153, 221, 0.2);
    
    /* 📏 NUEVAS VARIABLES - GRILLAS */
    --grid-gap: 0.85rem;
    --grid-cols-2: repeat(2, minmax(0, 1fr));
    --grid-cols-3: repeat(3, minmax(0, 1fr));
    --grid-cols-5: repeat(5, minmax(0, 1fr));
    
    /* 🪟 EFECTOS GLASS ADICIONALES */
    --glass-bg-dark: rgba(10, 15, 30, 0.75);
    --glass-border-dark: rgba(255, 255, 255, 0.1);
    
    /* ✅ USAR EN LUGAR DE --radius: 16px; */
    --radius-default: var(--radius-lg);
}
```

---

## 2. CAMBIOS ESPECÍFICOS POR SELECTOR

### A. `.badge` - Consolidado (Mantener segunda definición)

#### ❌ ELIMINAR (Líneas 561-582)
```css
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

.badge.accent { background: rgba(0, 212, 255, 0.15); color: var(--accent); }
.badge.cyan { background: rgba(0, 153, 204, 0.15); color: var(--accent-2); }
.badge.success { background: rgba(0, 255, 136, 0.15); color: var(--success); }
.badge.danger { background: rgba(255, 68, 68, 0.15); color: var(--danger); }

[data-theme="dark"] .badge.accent { background: rgba(0, 229, 255, 0.2); }
[data-theme="dark"] .badge.cyan { background: rgba(0, 153, 221, 0.2); }
[data-theme="dark"] .badge.success { background: rgba(0, 255, 153, 0.2); }
[data-theme="dark"] .badge.danger { background: rgba(255, 102, 102, 0.2); }
```

#### ✅ MANTENER (Líneas 1244-1272) + OPTIMIZACIÓN
```css
.badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);      /* 0.4rem */
    padding: 0.4rem 0.7rem;
    border-radius: var(--radius-full);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 800;
}

.badge.accent {
    background: rgba(255, 179, 71, 0.12);
    color: var(--accent);
}

.badge.cyan {
    background: rgba(89, 216, 255, 0.12);
    color: var(--accent-2);
}

.badge.success {
    background: rgba(61, 220, 151, 0.12);
    color: var(--success);
}

.badge.danger {
    background: rgba(255, 107, 107, 0.12);
    color: var(--danger);
}
```

---

### B. Media Query duplicado - Consolidación

#### ❌ ELIMINAR (Líneas 1069-1091)
```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }

    .reveal.is-visible {
        transition: none;
    }

    .ripple,
    .btn-ripple {
        display: none;
    }

    .site-nav a::after,
    .btn::after {
        display: none;
    }
}
```

#### ❌ ELIMINAR (Líneas 1094-1102) - DUPLICADO
```css
@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

#### ✅ REEMPLAZAR CON (Consolidado y optimizado)
```css
@media (prefers-reduced-motion: reduce) {
    html,
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }

    .reveal.is-visible {
        transition: none;
    }

    .ripple,
    .btn-ripple {
        display: none;
    }

    .site-nav a::after,
    .btn::after {
        display: none;
    }
}
```

---

### C. Uso de variables en transiciones

#### ❌ ANTES
```css
.theme-toggle {
    transition: all 200ms ease;
}

.btn {
    transition: all 200ms ease;
}

.schedule-switch button {
    transition: all 200ms ease;
}

.feature-card {
    transition: all 200ms ease;
}
```

#### ✅ DESPUÉS
```css
.theme-toggle {
    transition: all var(--transition-base);
}

.btn {
    transition: all var(--transition-base);
}

.schedule-switch button {
    transition: all var(--transition-base);
}

.feature-card {
    transition: all var(--transition-base);
}
```

---

### D. Uso de variables en border-radius

#### ❌ ANTES (Múltiples valores hardcoded)
```css
.skip-link {
    border-radius: 999px;  /* Línea 78 */
}

.theme-toggle {
    border-radius: 12px;   /* Línea 160 */
}

.site-nav {
    border-radius: 14px;   /* Línea 229 */
}
```

#### ✅ DESPUÉS
```css
.skip-link {
    border-radius: var(--radius-full);
}

.theme-toggle {
    border-radius: var(--radius-md);
}

.site-nav {
    border-radius: var(--radius-lg);
}
```

---

### E. Uso de variables en spacing/padding

#### ❌ ANTES
```css
.hero-panel,
.card,
.contact-card {
    padding: 1.5rem;       /* Línea 503 */
}

.hero-panel,
.card {
    padding: 1.5rem;       /* Línea 503 (repetido) */
}

.section {
    padding: 3.5rem 0;     /* Línea 323 */
}
```

#### ✅ DESPUÉS
```css
.hero-panel,
.card,
.contact-card {
    padding: var(--spacing-lg);
}

.section {
    padding: var(--spacing-2xl) 0;
}
```

---

### F. Consolidar .list (resolver conflictos)

#### ❌ VERSIÓN 1 (Líneas 583-598)
```css
.list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.65rem;           /* ⚠️ DIFERENTE EN VERSIÓN 2 */
}

.list li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
    color: var(--text-muted);
    padding-bottom: 0.65rem;  /* ⚠️ DIFERENTE EN VERSIÓN 2 */
    border-bottom: 1px solid rgba(0, 212, 255, 0.1);  /* ⚠️ DIFERENTE EN VERSIÓN 2 */
}

.list li strong { color: var(--text); }
```

#### ❌ VERSIÓN 2 (Líneas 1279-1299)
```css
.list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.7rem;            /* ⚠️ ACTUALIZADO */
}

.list li {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    align-items: center;
    color: var(--muted);
    padding-bottom: 0.7rem;  /* ⚠️ ACTUALIZADO */
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);  /* ⚠️ ACTUALIZADO */
}

.list li strong {
    color: var(--text);
}
```

#### ✅ CONSOLIDADA (Usar esta versión optimizada)
```css
.list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--spacing-md);  /* 0.7rem - versión 2 */
}

.list li {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-sm);
    align-items: center;
    color: var(--muted);
    padding-bottom: 0.7rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);  /* Más visible */
}

.list li strong {
    color: var(--text);
}
```

---

## 3. REFACTORIZAR GRILLAS

### ❌ ANTES (Valores hardcoded)
```css
.feature-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.85rem;
    margin-top: 1rem;
}

@media (min-width: 640px) {
    .feature-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 896px) {
    .feature-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 980px) {
    .feature-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}
```

### ✅ DESPUÉS (Con variables)
```css
.feature-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--grid-gap);
    margin-top: var(--spacing-md);
}

@media (min-width: 640px) {
    .feature-grid {
        grid-template-columns: var(--grid-cols-2);
    }
}

@media (min-width: 896px) {
    .feature-grid {
        grid-template-columns: var(--grid-cols-3);
    }
}

@media (min-width: 980px) {
    .feature-grid {
        grid-template-columns: var(--grid-cols-5);
    }
}
```

---

## 4. CREAR CLASES UTILITARIAS

### Nuevas clases reutilizables

```css
/* Transiciones */
.transition-fast { transition: all var(--transition-fast); }
.transition-base { transition: all var(--transition-base); }
.transition-slow { transition: all var(--transition-slow); }

/* Border radius */
.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }

/* Padding */
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.p-xl { padding: var(--spacing-xl); }

/* Gap/Spacing */
.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }

/* Hover effects */
.hover-lift:hover {
    transform: translateY(var(--hover-lift));
}

/* Backgrounds con accent */
.bg-accent-5 { background: var(--accent-5); }
.bg-accent-10 { background: var(--accent-10); }
.bg-accent-15 { background: var(--accent-15); }
```

---

## 5. RESUMEN DE CAMBIOS

### Líneas a ELIMINAR:
- Líneas 561-582 (`.badge` v1)
- Línea 12 (--warning)
- Línea 16 (--radius duplicado)
- Líneas 1069-1091 (primer prefers-reduced-motion)
- Líneas 1094-1102 (segundo prefers-reduced-motion duplicado)
- Líneas 583-598 (`.list` v1)
- Y más...

**Total: ~180 líneas para eliminar**

### Líneas a AGREGAR:
- 40 líneas en `:root` (nuevas variables)
- 20 líneas de clases utilitarias
- Refactorización en algunos selectores (+5-10 líneas netas)

**Total: ~40 líneas netas a agregar**

### Resultado Final:
```
Antes:   1,582 líneas
Después: ~1,350 líneas (85% del original)
Reducción: 232 líneas (-14.7%)
```

**Con optimizaciones adicionales: 1,100-1,150 líneas (-30%)**

---

## 6. CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear/actualizar `:root` con nuevas variables
- [ ] Eliminar `.badge` duplicado
- [ ] Consolidar media query de accesibilidad
- [ ] Consolidar `.list` y resolver conflictos
- [ ] Consolidar `.table`
- [ ] Consolidar `.faq-item`
- [ ] Actualizar `.badge` con variables
- [ ] Reemplazar `border-radius` hardcoded
- [ ] Reemplazar `transition` hardcoding
- [ ] Reemplazar `padding` con variables
- [ ] Actualizar grillas con variables
- [ ] Crear clases utilitarias
- [ ] Testing en navegadores
- [ ] Validación de performance

