// ============================================================
// CONSTANTES GLOBALES
// ============================================================

const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DOM = {
    navToggle: () => document.querySelector('[data-nav-toggle]'),
    nav: () => document.querySelector('[data-nav]'),
    skipLink: () => document.querySelector('.skip-link'),
    announcer: () => document.getElementById('announcements'),
};

const AUTH = {
    client: null,
    config: null,
    session: null,
    profile: null,
    initialized: false,
};

const FACULTIES = ['FIIS', 'FIME', 'FIPA', 'FIQ', 'FIEE', 'FCS', 'FCC', 'FCE', 'FCA', 'FCDE', 'FIARN', 'FCNM'];
const AUTH_FLASH_KEY = 'unac_auth_flash';

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    document.documentElement.classList.add('js');
    initThemeToggle();
    initNavigation();
    initRevealAnimations();
    initInteractiveElements();
    initFocusManagement();
    initAriaUpdates();
    initScheduleSwitches();
    initScheduleExplorer();
    initFaqs();
    await initAuth();
    initAuthUi();
    initHomeWelcome();
    initLoginPage();
    applyRouteGuards();
    initRegistrationForm();
    initAccessibilityAnnouncements();
});

/**
 * Consolida interacciones de cards, buttons y ripple effects
 */
function initInteractiveElements() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        const card = e.target.closest('.feature-card, .cta-card, .news-card, .card');
        
        if (PREFERS_REDUCED_MOTION) return;
        
        if (btn) createRipple(e, btn, 'btn-ripple');
        if (card) createRipple(e, card, 'ripple');
        
        if (btn && !btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent.trim());
        }
    });
}

/**
 * Inicializa navegación principal
 * - Maneja toggle del menú móvil (click, Escape)
 * - Actualiza aria-current en link activo según página
 * - Anuncia estado del menú a screen readers
 */
function initNavigation() {
    const navToggle = DOM.navToggle();
    const nav = DOM.nav();
    const page = document.body.dataset.page;

    if (navToggle && nav) {
        // Asegurar que nav tiene role="navigation"
        if (!nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Navegación principal');
        }

        const toggleMenu = (forceClose = false) => {
            const isOpen = nav.classList.contains('is-open');
            if (isOpen || forceClose) {
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            } else {
                nav.classList.add('is-open');
                navToggle.setAttribute('aria-expanded', 'true');
            }
        };

        navToggle.addEventListener('click', () => toggleMenu());

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && nav.classList.contains('is-open')) {
                toggleMenu(true);
                navToggle.focus();
            }
        });

        nav.addEventListener('click', event => {
            if (event.target.matches('a')) toggleMenu(true);
        });

        // Evita estados inconsistentes al pasar a desktop.
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 980 && nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (page) {
        document.querySelectorAll('[data-nav-link]').forEach(link => {
            if (link.dataset.navLink === page) {
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
}

/**
 * Inicializa animaciones suaves de reveal con Intersection Observer
 * Aplica stagger animation respetando prefers-reduced-motion
 */
function initRevealAnimations() {
    const items = document.querySelectorAll('.reveal');

    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
        items.forEach(item => item.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                if (!PREFERS_REDUCED_MOTION) {
                    entry.target.style.setProperty('--reveal-delay', `${index * 75}ms`);
                }
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach(item => observer.observe(item));
}

/**
 * Utilidad para crear ripple effect
 * @param {Event} e - Evento de click
 * @param {Element} element - Elemento donde crear el ripple
 * @param {String} className - Clase del ripple (ripple o btn-ripple)
 */
function createRipple(e, element, className) {
    const ripple = document.createElement('span');
    ripple.classList.add(className);
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

/**
 * Gestiona focus y navegación por teclado
 * - Detecta navegación por Tab para mostrar focus indicators
 * - Implementa skip link funcional
 * - Resetea indicadores al usar ratón
 */
function initFocusManagement() {
    const nav = DOM.nav();
    const toggle = DOM.navToggle();

    // Consolidar keyboard navigation en un solo listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        } else if (e.key === 'Escape') {
            if (nav?.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            }
            document.body.classList.remove('keyboard-nav');
        }
    });

    document.addEventListener('click', () => {
        document.body.classList.remove('keyboard-nav');
    });

    // Enfocar el contenido principal al presionar skip link
    const skipLink = DOM.skipLink();
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('[id="content"]');
            if (mainContent) {
                mainContent.tabIndex = -1;
                mainContent.focus();
                mainContent.addEventListener('blur', () => mainContent.removeAttribute('tabindex'));
            }
        });
    }
}

/**
 * Actualiza ARIA labels dinámicamente
 * - Vincula secciones a sus headings (aria-labelledby)
 * - Marca SVG como decorativos (aria-hidden)
 */
function initAriaUpdates() {
    // Actualizar ARIA labels dinámicamente
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        if (!section.getAttribute('aria-labelledby')) {
            const heading = section.querySelector('h1, h2, h3');
            if (heading) {
                const id = heading.id || `section-heading-${index}`;
                heading.id = id;
                section.setAttribute('aria-labelledby', id);
            }
        }
    });

    // Asegurar que los iconos SVG tengan aria-hidden
    document.querySelectorAll('.feature-icon svg, .contact-icon svg').forEach(svg => {
        if (!svg.getAttribute('aria-hidden')) {
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
        }
    });
}

function initAccessibilityAnnouncements() {
    // Crear región viva para anuncios dinámicos
    if (!document.querySelector('[role="status"]')) {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.setAttribute('class', 'sr-only');
        liveRegion.id = 'announcements';
        document.body.appendChild(liveRegion);
    }
}

function initScheduleSwitches() {
    const switchButtons = document.querySelectorAll('[data-schedule-target]');
    const panels = document.querySelectorAll('[data-schedule-panel]');

    if (!switchButtons.length || !panels.length) {
        return;
    }

    const activate = target => {
        switchButtons.forEach(button => {
            button.classList.toggle('is-active', button.dataset.scheduleTarget === target);
            button.setAttribute('aria-selected', button.dataset.scheduleTarget === target ? 'true' : 'false');
        });

        panels.forEach(panel => {
            const isActive = panel.dataset.schedulePanel === target;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
        });

        document.dispatchEvent(new CustomEvent('schedule:panel-change', {
            detail: { target }
        }));
    };

    switchButtons.forEach(button => {
        button.addEventListener('click', () => activate(button.dataset.scheduleTarget));
    });

    activate(switchButtons[0].dataset.scheduleTarget);
}

function initScheduleExplorer() {
    const explorer = document.querySelector('[data-schedule-explorer]');
    if (!explorer) {
        return;
    }

    const toggleButton = document.querySelector('[data-schedule-toggle]');

    const searchInput = explorer.querySelector('[data-schedule-search]');
    const statusSelect = explorer.querySelector('[data-schedule-status]');
    const sortSelect = explorer.querySelector('[data-schedule-sort]');
    const resetButton = explorer.querySelector('[data-schedule-reset]');

    const widgets = {
        trips: document.querySelector('[data-schedule-stat="trips"]'),
        firstTrip: document.querySelector('[data-schedule-stat="first-trip"]'),
        peak: document.querySelector('[data-schedule-stat="peak"]'),
        capacity: document.querySelector('[data-schedule-stat="capacity"]')
    };

    const getActivePanel = () => document.querySelector('[data-schedule-panel].is-active');

    const setExplorerVisibility = (isVisible) => {
        explorer.hidden = !isVisible;
        if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
            toggleButton.textContent = isVisible ? 'Ocultar filtros' : 'Mostrar filtros';
        }
    };

    const getStatus = row => {
        const badge = row.querySelector('.badge');
        return badge ? badge.textContent.trim().toLowerCase() : '';
    };

    const renderCards = (panel, rows) => {
        const cardsHost = panel.querySelector('[data-schedule-cards]');
        if (!cardsHost) {
            return;
        }

        cardsHost.innerHTML = '';
        const visibleRows = rows.filter(row => !row.hidden);

        visibleRows.forEach(row => {
            const time = row.cells?.[0]?.textContent.trim() || '--:--';
            const route = row.cells?.[2]?.textContent.trim() || 'N/A';
            const seats = row.cells?.[3]?.textContent.trim() || 'N/A';
            const capacity = row.cells?.[4]?.textContent.trim() || 'N/A';
            const statusBadge = row.querySelector('.badge');

            const card = document.createElement('article');
            card.className = 'schedule-card';

            const head = document.createElement('div');
            head.className = 'schedule-card-head';

            const timeNode = document.createElement('strong');
            timeNode.className = 'schedule-card-time';
            timeNode.textContent = time;
            head.appendChild(timeNode);

            if (statusBadge) {
                const badgeCopy = statusBadge.cloneNode(true);
                head.appendChild(badgeCopy);
            }

            const details = document.createElement('div');
            details.className = 'schedule-card-grid';

            const makeRow = (label, value) => {
                const rowNode = document.createElement('div');
                rowNode.className = 'schedule-card-row';
                const labelNode = document.createElement('span');
                labelNode.textContent = label;
                const valueNode = document.createElement('strong');
                valueNode.textContent = value;
                rowNode.appendChild(labelNode);
                rowNode.appendChild(valueNode);
                return rowNode;
            };

            details.appendChild(makeRow('Ruta', route));
            details.appendChild(makeRow('Asientos', seats));
            details.appendChild(makeRow('Capacidad', capacity));

            card.appendChild(head);
            card.appendChild(details);
            cardsHost.appendChild(card);
        });
    };

    const getCapacity = row => {
        const text = row.cells?.[3]?.textContent || '0';
        const value = parseInt(text.replace(/[^\d]/g, ''), 10);
        return Number.isFinite(value) ? value : 0;
    };

    const parseTimeToMinutes = (rawTime) => {
        if (!rawTime) return Infinity;
        const parts = rawTime.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!parts) return Infinity;

        let hour = parseInt(parts[1], 10);
        const minutes = parseInt(parts[2], 10);
        const period = parts[3].toUpperCase();

        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return (hour * 60) + minutes;
    };

    const updateWidgets = (rows) => {
        const visibleRows = rows.filter(row => !row.hidden);
        const totalTrips = visibleRows.length;
        const totalCapacity = visibleRows.reduce((sum, row) => sum + getCapacity(row), 0);
        const peakTrips = visibleRows.filter(row => getStatus(row) === 'pico').length;

        const firstTime = visibleRows
            .map(row => row.cells?.[0]?.textContent.trim() || '')
            .filter(Boolean)
            .sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b))[0] || '--:--';

        if (widgets.trips) widgets.trips.textContent = String(totalTrips);
        if (widgets.firstTrip) widgets.firstTrip.textContent = firstTime;
        if (widgets.peak) widgets.peak.textContent = String(peakTrips);
        if (widgets.capacity) widgets.capacity.textContent = String(totalCapacity);
    };

    const applyFilters = () => {
        const panel = getActivePanel();
        if (!panel) {
            return;
        }

        const tbody = panel.querySelector('tbody');
        if (!tbody) {
            return;
        }

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const statusFilter = (statusSelect?.value || 'all').toLowerCase();
        const searchText = (searchInput?.value || '').trim().toLowerCase();
        const sortValue = sortSelect?.value || 'time-asc';

        const sortedRows = rows.slice().sort((a, b) => {
            if (sortValue === 'capacity-desc') {
                return getCapacity(b) - getCapacity(a);
            }

            const timeA = parseTimeToMinutes(a.cells?.[0]?.textContent || '');
            const timeB = parseTimeToMinutes(b.cells?.[0]?.textContent || '');
            if (sortValue === 'time-desc') {
                return timeB - timeA;
            }
            return timeA - timeB;
        });

        sortedRows.forEach(row => tbody.appendChild(row));

        sortedRows.forEach(row => {
            const status = getStatus(row);
            const text = row.textContent.toLowerCase();
            const matchesStatus = statusFilter === 'all' || status === statusFilter;
            const matchesSearch = !searchText || text.includes(searchText);
            row.hidden = !(matchesStatus && matchesSearch);
        });

        const emptyMessage = panel.querySelector('[data-schedule-empty]');
        const hasVisibleRows = sortedRows.some(row => !row.hidden);
        if (emptyMessage) {
            emptyMessage.hidden = hasVisibleRows;
        }

        renderCards(panel, sortedRows);
        updateWidgets(sortedRows);
    };

    searchInput?.addEventListener('input', applyFilters);
    statusSelect?.addEventListener('change', applyFilters);
    sortSelect?.addEventListener('change', applyFilters);

    toggleButton?.addEventListener('click', () => {
        const isVisible = toggleButton.getAttribute('aria-expanded') === 'true';
        setExplorerVisibility(!isVisible);
    });

    resetButton?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (statusSelect) statusSelect.value = 'all';
        if (sortSelect) sortSelect.value = 'time-asc';
        applyFilters();
    });

    document.addEventListener('schedule:panel-change', applyFilters);
    setExplorerVisibility(false);
    applyFilters();
}

function initFaqs() {
    const faqButtons = document.querySelectorAll('[data-faq-button]');

    if (!faqButtons.length) {
        return;
    }

    faqButtons.forEach((button, index) => {
        const id = button.id || `faq-button-${index}`;
        button.id = id;

        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            if (!item) {
                return;
            }

            const willOpen = !item.classList.contains('is-open');
            const answerId = `faq-answer-${index}`;
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.id = answerId;
                button.setAttribute('aria-expanded', willOpen);
                button.setAttribute('aria-controls', answerId);
            }

            document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('is-open'));
            if (willOpen) {
                item.classList.add('is-open');
            }
        });
    });
}

function initRegistrationForm() {
    const form = document.querySelector('[data-register-form]');
    const message = document.querySelector('[data-register-message]');

    if (!form || !message) {
        return;
    }

    if (!AUTH.session) {
        showMessage(message, 'Debes iniciar sesion con tu correo institucional para continuar con el registro.', 'error');
        return;
    }

    const fields = {
        nombre: form.querySelector('#nombre'),
        dni: form.querySelector('#dni'),
        facultad: form.querySelector('#facultad'),
        horario: form.querySelector('#horario'),
        documento: form.querySelector('#documentoPdf'),
        terms: form.querySelector('#terms')
    };

    if (!fields.nombre || !fields.dni || !fields.facultad || !fields.horario || !fields.documento || !fields.terms) {
        showMessage(message, 'El formulario no tiene todos los campos requeridos para registro protegido.', 'error');
        return;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const values = {
            nombre: fields.nombre.value.trim(),
            dni: fields.dni.value.trim(),
            facultad: fields.facultad.value,
            horario: fields.horario.value,
            terms: fields.terms.checked,
            documento: fields.documento.files?.[0]
        };

        const validFaculty = FACULTIES.includes(values.facultad);
        const hasPdf = Boolean(values.documento);
        const isPdf = hasPdf && values.documento.type === 'application/pdf';
        const validSize = hasPdf && values.documento.size <= 5 * 1024 * 1024;

        const invalid = !values.nombre || values.dni.length < 8 || !validFaculty || !values.horario || !values.terms || !hasPdf || !isPdf || !validSize;
        if (invalid) {
            showMessage(message, 'Completa los campos, acepta terminos y sube un PDF valido de hasta 5MB.', 'error');
            return;
        }

        if (!AUTH.client || !AUTH.config) {
            showMessage(message, 'Supabase no esta configurado. Actualiza assets/js/supabase-config.js.', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }
        showMessage(message, 'Guardando datos y subiendo PDF...', 'info');

        const filePath = `${AUTH.session.user.id}/${Date.now()}-${sanitizeFileName(values.documento.name)}`;

        const payload = {
            user_id: AUTH.session.user.id,
            full_name: values.nombre,
            dni: values.dni,
            facultad: values.facultad,
            horario: values.horario,
            document_path: filePath,
            updated_at: new Date().toISOString()
        };

        const { error: profileError } = await AUTH.client
            .from(AUTH.config.profileTable)
            .upsert(payload, { onConflict: 'user_id' });

        if (profileError) {
            if (submitButton) {
                submitButton.disabled = false;
            }
            showMessage(message, 'No se pudo guardar el perfil. Verifica las politicas RLS y la tabla de perfiles.', 'error');
            return;
        }

        const { error: storageError } = await AUTH.client.storage
            .from(AUTH.config.privateBucket)
            .upload(filePath, values.documento, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (storageError) {
            if (submitButton) {
                submitButton.disabled = false;
            }
            showMessage(message, 'No se pudo subir el PDF al bucket privado. Revisa politicas de Storage.', 'error');
            return;
        }

        AUTH.profile = {
            full_name: values.nombre,
            dni: values.dni,
            facultad: values.facultad,
            horario: values.horario,
            document_path: filePath
        };
        initHomeWelcome();
        initAuthUi();

        showMessage(
            message,
            `Registro guardado para ${values.nombre}. Tu documento PDF se almaceno de forma privada y segura.`,
            'success'
        );
        form.reset();

        if (submitButton) {
            submitButton.disabled = false;
        }
    });
}

function showMessage(element, text, type) {
    element.className = `message is-visible ${type}`;
    element.textContent = text;
}

function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
}

function isInstitutionalEmail(email) {
    const normalized = normalizeEmail(email);
    const domain = AUTH.config?.allowedEmailDomain || 'unac.edu.pe';
    return normalized.endsWith(`@${domain}`);
}

function getAppPath(target) {
    const inPages = window.location.pathname.toLowerCase().includes('/pages/');
    if (!inPages) {
        return target;
    }

    if (target.startsWith('pages/')) {
        return target.slice('pages/'.length);
    }

    return `../${target}`;
}

function setAuthFlash(message) {
    sessionStorage.setItem(AUTH_FLASH_KEY, message);
}

function consumeAuthFlash() {
    const flash = sessionStorage.getItem(AUTH_FLASH_KEY);
    if (flash) {
        sessionStorage.removeItem(AUTH_FLASH_KEY);
    }
    return flash;
}

function sanitizeFileName(name) {
    return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase();
}

function getDisplayName() {
    const profileName = AUTH.profile?.full_name?.trim();
    if (profileName) {
        return profileName;
    }

    const metadata = AUTH.session?.user?.user_metadata || {};
    const fallback = metadata.full_name || metadata.name || AUTH.session?.user?.email || 'Estudiante UNAC';
    return String(fallback).trim();
}

function getInitials(name) {
    const tokens = (name || '').split(/\s+/).filter(Boolean);
    if (!tokens.length) {
        return 'UN';
    }

    return tokens.slice(0, 2).map(token => token[0].toUpperCase()).join('');
}

async function fetchProfileByUserId(userId) {
    if (!AUTH.client || !AUTH.config || !userId) {
        return null;
    }

    const { data, error } = await AUTH.client
        .from(AUTH.config.profileTable)
        .select('full_name, dni, facultad, horario, document_path')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        return null;
    }

    return data;
}

async function initAuth() {
    AUTH.config = window.__SUPABASE_CONFIG__ || null;

    const hasLib = Boolean(window.supabase?.createClient);
    const configured = Boolean(
        AUTH.config?.url
        && AUTH.config?.anonKey
        && !AUTH.config.url.includes('YOUR-PROJECT-REF')
        && !AUTH.config.anonKey.includes('YOUR_SUPABASE_ANON_KEY')
    );

    if (!hasLib || !configured) {
        document.body.dataset.authState = 'disabled';
        AUTH.initialized = true;
        return;
    }

    AUTH.client = window.supabase.createClient(AUTH.config.url, AUTH.config.anonKey, {
        auth: {
            detectSessionInUrl: true,
            persistSession: true,
            autoRefreshToken: true,
        }
    });

    const { data } = await AUTH.client.auth.getSession();
    AUTH.session = data.session;

    if (AUTH.session && !isInstitutionalEmail(AUTH.session.user?.email)) {
        await AUTH.client.auth.signOut();
        AUTH.session = null;
        setAuthFlash('Solo se permite acceso con correo institucional @unac.edu.pe.');
    }

    if (AUTH.session) {
        AUTH.profile = await fetchProfileByUserId(AUTH.session.user.id);
    }

    AUTH.client.auth.onAuthStateChange(async (_, session) => {
        AUTH.session = session;

        if (AUTH.session && !isInstitutionalEmail(AUTH.session.user?.email)) {
            await AUTH.client.auth.signOut();
            AUTH.session = null;
            AUTH.profile = null;
            setAuthFlash('Solo se permite acceso con correo institucional @unac.edu.pe.');
        } else if (AUTH.session) {
            AUTH.profile = await fetchProfileByUserId(AUTH.session.user.id);
        } else {
            AUTH.profile = null;
        }

        initAuthUi();
        initHomeWelcome();
        applyRouteGuards();
    });

    AUTH.initialized = true;
}

function getLoginHrefWithNext() {
    const loginPath = getAppPath('pages/login.html');
    const next = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    return `${loginPath}?next=${next}`;
}

function getRegistroHref() {
    return getAppPath('pages/registro.html');
}

function getIndexHref() {
    return getAppPath('index.html');
}

function syncProtectedLinks() {
    const protectedLinks = document.querySelectorAll('[data-requires-auth]');
    protectedLinks.forEach(link => {
        if (!link.dataset.protectedHref) {
            link.dataset.protectedHref = link.getAttribute('href') || getRegistroHref();
        }

        if (AUTH.session) {
            link.setAttribute('href', link.dataset.protectedHref);
            link.removeAttribute('aria-disabled');
        } else {
            link.setAttribute('href', getLoginHrefWithNext());
            link.setAttribute('aria-disabled', 'true');
        }
    });
}

function renderNavAuthSlot() {
    // 1. Apuntamos al contenedor derecho en lugar del menú central
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    let slot = document.querySelector('[data-auth-nav-item]');
    if (!slot) {
        slot = document.createElement('div');
        slot.className = 'auth-nav-item';
        slot.setAttribute('data-auth-nav-item', '');
        // Lo insertamos justo antes del botón hamburguesa
        const navToggle = headerActions.querySelector('.nav-toggle');
        headerActions.insertBefore(slot, navToggle);
    }

    if (!AUTH.session) {
        slot.innerHTML = `<a class="auth-login-link" href="${getLoginHrefWithNext()}" aria-label="Iniciar sesion institucional">Iniciar sesión</a>`;
        return;
    }

    const fullName = getDisplayName();
    const initials = getInitials(fullName);
    
    // 2. Creamos la estructura HTML del Dropdown
    slot.innerHTML = `
        <div class="auth-dropdown-container" id="user-dropdown">
            <button class="auth-profile-toggle" aria-expanded="false" aria-controls="dropdown-menu">
                <span class="auth-avatar" aria-hidden="true">${initials}</span>
                <span class="auth-profile-name">${fullName}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px; color: var(--muted);">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="auth-dropdown-menu" id="dropdown-menu">
                <a href="${getRegistroHref()}">Ver mi perfil</a>
                <button type="button" data-auth-logout>Cerrar sesión</button>
            </div>
        </div>
    `;

    // 3. Lógica de Interacción del Dropdown
    const dropdownContainer = slot.querySelector('#user-dropdown');
    const toggleBtn = slot.querySelector('.auth-profile-toggle');
    const logoutBtn = slot.querySelector('[data-auth-logout]');

    // Abrir/Cerrar menú al dar click al nombre
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que se cierre inmediatamente
        const isActive = dropdownContainer.classList.toggle('is-active');
        toggleBtn.setAttribute('aria-expanded', isActive);
    });

    // Cerrar el menú si haces click en cualquier otro lado de la página
    document.addEventListener('click', (e) => {
        if (dropdownContainer && !dropdownContainer.contains(e.target)) {
            dropdownContainer.classList.remove('is-active');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Acción de cerrar sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (!AUTH.client) return;
            await AUTH.client.auth.signOut();
            window.location.href = getIndexHref();
        });
    }
}

function syncHeroAuthActions() {
    const heroAction = document.querySelector('[data-auth-cta]');
    if (!heroAction) {
        return;
    }

    if (AUTH.session) {
        heroAction.textContent = 'Ir a mi registro';
        heroAction.setAttribute('href', getRegistroHref());
    } else {
        heroAction.textContent = 'Iniciar sesion';
        heroAction.setAttribute('href', getLoginHrefWithNext());
    }
}

function initAuthUi() {
    const state = AUTH.session ? 'authenticated' : 'guest';
    document.body.dataset.authState = AUTH.client ? state : 'disabled';
    renderNavAuthSlot();
    syncProtectedLinks();
    syncHeroAuthActions();
}

function initHomeWelcome() {
    const welcomeTarget = document.querySelector('[data-home-user-name]');
    if (!welcomeTarget) {
        return;
    }

    welcomeTarget.textContent = AUTH.session ? getDisplayName() : 'Movilidad UNAC';
}

function applyRouteGuards() {
    const page = document.body.dataset.page;
    if (page === 'registro' && !AUTH.session) {
        window.location.href = getLoginHrefWithNext();
    }
}

function getRedirectDestinationFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || sessionStorage.getItem('unac_auth_next') || '';
    if (!next) {
        return getIndexHref();
    }

    if (next.startsWith('http://') || next.startsWith('https://')) {
        return getIndexHref();
    }

    return next;
}

async function initLoginPage() {
    if (document.body.dataset.page !== 'login') {
        return;
    }

    const message = document.querySelector('[data-login-message]');
    const loginButton = document.querySelector('[data-login-google]');

    const flash = consumeAuthFlash();
    if (flash && message) {
        showMessage(message, flash, 'error');
    }

    if (AUTH.session) {
        window.location.href = getRedirectDestinationFromQuery();
        return;
    }

    if (!loginButton) {
        return;
    }

    loginButton.addEventListener('click', async () => {
        if (!AUTH.client || !AUTH.config) {
            if (message) {
                showMessage(message, 'Configura Supabase en assets/js/supabase-config.js antes de iniciar sesion.', 'error');
            }
            return;
        }

        loginButton.disabled = true;
        if (message) {
            showMessage(message, 'Abriendo Google para autenticar cuenta institucional...', 'info');
        }

        const nextDestination = getRedirectDestinationFromQuery();
        sessionStorage.setItem('unac_auth_next', nextDestination);

        const redirectUrl = new URL(AUTH.config.redirectTo || window.location.href);
        redirectUrl.searchParams.set('next', nextDestination);

        const { error } = await AUTH.client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl.toString(),
                queryParams: {
                    prompt: 'select_account'
                }
            }
        });

        if (error) {
            loginButton.disabled = false;
            if (message) {
                showMessage(message, 'No se pudo iniciar sesion. Revisa configuracion OAuth en Supabase.', 'error');
            }
        }
    });
}

/**
 * Gestiona tema oscuro/claro
 * - Detecta preferencia del sistema (prefers-color-scheme)
 * - Persiste en localStorage
 * - Iconos se manejan vía CSS (no JavaScript)
 */
function initThemeToggle() {
    const html = document.documentElement;
    const toggle = document.querySelector('[data-theme-toggle]');
    
    if (!toggle) return;

    const getPreferredTheme = () => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setTheme = (theme) => {
        const isDark = theme === 'dark';
        html.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    const currentTheme = getPreferredTheme();
    setTheme(currentTheme);

    toggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}
